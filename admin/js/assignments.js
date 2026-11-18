document.addEventListener('DOMContentLoaded', () => {
  const buildings = window.RoomQ && window.RoomQ.buildings;
  const form = document.getElementById('assignmentForm');
  const buildingSelect = document.getElementById('assignmentBuilding');
  const floorSelect = document.getElementById('assignmentFloor');
  const roomSelect = document.getElementById('assignmentRoom');
  const dateInput = document.getElementById('assignmentDate');
  const startInput = document.getElementById('assignmentStart');
  const endInput = document.getElementById('assignmentEnd');
  const feedback = document.getElementById('assignmentFeedback');
  const list = document.getElementById('assignmentList');
  const count = document.getElementById('assignmentCount');
  const floorPlanCanvas = document.getElementById('assignmentFloorPlanCanvas');
  const floorPlanStage = document.getElementById('assignmentPlanStage');
  const floorPlanSourceLayer = document.getElementById('assignmentPlanSourceLayer');
  const floorPlanImage = document.querySelector('.assignment-floorplan-image');
  const floorPlanOverlayLayer = document.getElementById('assignmentPlanOverlayLayer');
  const floorPlanLabel = document.getElementById('assignmentFloorPlanLabel');
  const floorPlanEmpty = document.getElementById('assignmentFloorPlanEmpty');
  const submitButton = form.querySelector('button[type="submit"]');
  const storageKey = 'roomq.roomUsage.v1';
  const requestStorageKey = 'roomq.roomRequests.v1';
  const requestList = document.getElementById('requestList');
  const requestCount = document.getElementById('requestPendingCount');
  const requestFeedback = document.getElementById('requestFeedback');
  let records = [];
  let requests = [];
  let storageReady = true;

  const startTimePicker = window.RoomQTime.attach(
    document.getElementById('assignmentStartPicker'),
    startInput
  );
  const endTimePicker = window.RoomQTime.attach(
    document.getElementById('assignmentEndPicker'),
    endInput
  );

  const localDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  dateInput.value = localDate;

  function getBuilding(id) {
    return buildings.find((building) => building.id === id);
  }

  function getFloor(building, id) {
    return building && building.floors.find((floor) => floor.id === id);
  }

  function getRoomNumber(floor, index, region) {
    return region.roomNumber !== undefined
      ? region.roomNumber
      : Number(floor.id) * 100 + index + 1;
  }

  function getRoomLabel(floor, index, region) {
    const roomNumber = getRoomNumber(floor, index, region);
    if (region.name) {
      return roomNumber === null ? region.name : `Room ${roomNumber} · ${region.name}`;
    }
    return `Room ${roomNumber}`;
  }

  function renderFloorPlan() {
    const building = getBuilding(buildingSelect.value);
    const floor = getFloor(building, floorSelect.value);
    floorPlanOverlayLayer.replaceChildren();

    if (!building || !floor) {
      floorPlanStage.hidden = true;
      floorPlanEmpty.hidden = false;
      floorPlanLabel.textContent = building
        ? `${building.name} · Select a floor`
        : 'Choose a building and floor';
      floorPlanEmpty.textContent = building && !building.floors.length
        ? 'No mapped floor layout is available for this building.'
        : 'Select a building and floor to preview its layout.';
      return;
    }

    const source = window.RoomQ.floorPlanSource;
    const crop = floor.crop;
    const scale = Math.min(
      Math.max(100, floorPlanCanvas.clientWidth - 24) / crop.width,
      Math.max(120, floorPlanCanvas.clientHeight - 24) / crop.height
    );
    floorPlanLabel.textContent = `${building.name} · ${floor.label}`;
    floorPlanStage.hidden = false;
    floorPlanEmpty.hidden = true;
    floorPlanStage.style.width = `${crop.width * scale}px`;
    floorPlanStage.style.height = `${crop.height * scale}px`;
    floorPlanSourceLayer.style.left = `${-crop.x * scale}px`;
    floorPlanSourceLayer.style.top = `${-crop.y * scale}px`;
    floorPlanSourceLayer.style.width = `${source.width * scale}px`;
    floorPlanSourceLayer.style.height = `${source.height * scale}px`;
    floorPlanImage.style.width = `${source.width * scale}px`;
    floorPlanImage.style.height = `${source.height * scale}px`;
    floorPlanOverlayLayer.style.width = `${source.width * scale}px`;
    floorPlanOverlayLayer.style.height = `${source.height * scale}px`;

    floor.staffRooms.forEach((staffRoom) => {
      const marker = document.createElement('span');
      marker.className = 'staff-room-region';
      marker.style.left = `${staffRoom.x * scale}px`;
      marker.style.top = `${staffRoom.y * scale}px`;
      marker.style.width = `${staffRoom.width * scale}px`;
      marker.style.height = `${staffRoom.height * scale}px`;
      marker.setAttribute('role', 'img');
      marker.setAttribute('aria-label', 'Office or staff room');
      floorPlanOverlayLayer.append(marker);
    });

    floor.regions.forEach((region, index) => {
      const roomNumber = getRoomNumber(floor, index, region);
      const roomLabel = getRoomLabel(floor, index, region);
      const overlay = document.createElement('button');
      overlay.type = 'button';
      overlay.className = 'classroom-region-overlay is-available';
      overlay.classList.toggle('is-selected', roomSelect.value === region.id);
      overlay.style.left = `${region.x * scale}px`;
      overlay.style.top = `${region.y * scale}px`;
      overlay.style.width = `${region.width * scale}px`;
      overlay.style.height = `${region.height * scale}px`;
      overlay.dataset.regionId = region.id;
      overlay.textContent = region.name || (roomNumber === null ? 'Room' : String(roomNumber));
      overlay.title = `${roomLabel} · ${building.name} · ${floor.label}`;
      overlay.setAttribute('aria-label', `${roomLabel}, ${building.name}, ${floor.label}. Select this room.`);
      overlay.addEventListener('click', () => {
        roomSelect.value = region.id;
        roomSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
      floorPlanOverlayLayer.append(overlay);
    });
  }

  function isValidRecord(record) {
    return Boolean(
      record &&
      typeof record === 'object' &&
      typeof record.id === 'string' &&
      typeof record.buildingId === 'string' &&
      typeof record.floorId === 'string' &&
      typeof record.regionId === 'string' &&
      typeof record.roomLabel === 'string' &&
      (record.roomNumber === null || Number.isInteger(record.roomNumber)) &&
      /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
      /^\d{2}:\d{2}$/.test(record.startTime) &&
      /^\d{2}:\d{2}$/.test(record.endTime) &&
      record.startTime < record.endTime
    );
  }

  function loadRecords() {
    storageReady = true;
    submitButton.disabled = false;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === null) {
        return [];
      }

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.some((record) => !isValidRecord(record))) {
        throw new Error('Saved room-use data has an invalid format.');
      }
      return parsed;
    } catch (error) {
      storageReady = false;
      console.error('Unable to load saved room-use data.', error);
      feedback.textContent = 'Saved assignments could not be loaded from this browser.';
      submitButton.disabled = true;
      return [];
    }
  }

  function saveRecords(updatedRecords) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
      records = updatedRecords;
      return true;
    } catch (error) {
      console.error('Unable to save room-use data.', error);
      feedback.textContent = 'Assignment could not be saved in this browser. Please try again.';
      return false;
    }
  }

  function updateFloors() {
    const building = getBuilding(buildingSelect.value);
    floorSelect.replaceChildren(new Option('Select a floor', ''));
    roomSelect.replaceChildren(new Option('Select a room', ''));
    floorSelect.disabled = !building || !building.floors.length;
    roomSelect.disabled = true;

    if (!building) {
      renderFloorPlan();
      return;
    }

    building.floors.forEach((floor) => {
      floorSelect.append(new Option(floor.label, floor.id));
    });
    renderFloorPlan();
  }

  function updateRooms() {
    const building = getBuilding(buildingSelect.value);
    const floor = getFloor(building, floorSelect.value);
    roomSelect.replaceChildren(new Option('Select a room', ''));
    roomSelect.disabled = !floor;
    if (!floor) {
      renderFloorPlan();
      return;
    }

    floor.regions.forEach((region, index) => {
      roomSelect.append(new Option(getRoomLabel(floor, index, region), region.id));
    });
    renderFloorPlan();
  }

  function renderRecords() {
    list.replaceChildren();
    count.textContent = String(records.length);
    if (!records.length) {
      const empty = document.createElement('p');
      empty.className = 'assignment-empty';
      empty.textContent = 'No room-use assignments have been saved yet.';
      list.append(empty);
      return;
    }

    const sortedRecords = [...records].sort((left, right) =>
      left.date.localeCompare(right.date) || left.startTime.localeCompare(right.startTime)
    );
    sortedRecords.forEach((record) => {
      const building = getBuilding(record.buildingId);
      const floor = getFloor(building, record.floorId);
      const item = document.createElement('article');
      item.className = 'assignment-record';

      const copy = document.createElement('div');
      copy.className = 'assignment-record-copy';
      const title = document.createElement('strong');
      title.textContent = record.roomLabel;
      const description = document.createElement('span');
      description.textContent = `${building ? building.name : record.buildingId} · ${floor ? floor.label : `Floor ${record.floorId}`} · ${record.date} · ${window.RoomQTime.format(record.startTime)}–${window.RoomQTime.format(record.endTime)}`;
      copy.append(title, description);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'room-use-remove';
      removeButton.textContent = 'Remove';
      removeButton.setAttribute('aria-label', `Remove ${record.roomLabel} assignment on ${record.date}`);
      removeButton.addEventListener('click', () => {
        if (saveRecords(records.filter((savedRecord) => savedRecord.id !== record.id))) {
          feedback.textContent = `Removed the assignment for ${record.roomLabel}.`;
          renderRecords();
        }
      });

      item.append(copy, removeButton);
      list.append(item);
    });
  }

  // ---------------------------------------------------------------------------
  // Reservation requests submitted from the User portal
  // ---------------------------------------------------------------------------
  function loadRequests() {
    try {
      const saved = window.localStorage.getItem(requestStorageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Unable to load reservation requests.', error);
      return [];
    }
  }

  function saveRequests(updatedRequests) {
    try {
      window.localStorage.setItem(requestStorageKey, JSON.stringify(updatedRequests));
      requests = updatedRequests;
      return true;
    } catch (error) {
      console.error('Unable to save reservation requests.', error);
      requestFeedback.textContent = 'The request could not be updated in this browser. Please try again.';
      return false;
    }
  }

  function updateRequestStatus(requestId, status) {
    return saveRequests(requests.map((request) =>
      request.id === requestId
        ? { ...request, status, reviewedAt: new Date().toISOString() }
        : request
    ));
  }

  function approveRequest(request) {
    if (!storageReady) {
      requestFeedback.textContent = 'Requests cannot be approved because saved assignments could not be loaded.';
      return;
    }

    const building = getBuilding(request.buildingId);
    const floor = getFloor(building, request.floorId);
    const regionIndex = floor
      ? floor.regions.findIndex((region) => region.id === request.regionId)
      : -1;
    const region = floor && floor.regions[regionIndex];
    if (!building || !floor || !region) {
      requestFeedback.textContent = `${request.roomLabel} no longer exists in the classroom layout, so it cannot be approved.`;
      return;
    }

    const conflict = records.find((record) =>
      record.buildingId === request.buildingId &&
      record.floorId === request.floorId &&
      record.regionId === request.regionId &&
      record.date === request.date &&
      request.startTime < record.endTime &&
      request.endTime > record.startTime
    );
    if (conflict) {
      requestFeedback.textContent = `Cannot approve: ${request.roomLabel} is already assigned ${window.RoomQTime.format(conflict.startTime)}–${window.RoomQTime.format(conflict.endTime)} on ${request.date}. Reject the request or remove the other assignment first.`;
      return;
    }

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      buildingId: building.id,
      floorId: floor.id,
      regionId: region.id,
      roomNumber: getRoomNumber(floor, regionIndex, region),
      roomName: region.name || '',
      roomLabel: getRoomLabel(floor, regionIndex, region),
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      requestId: request.id,
      purpose: request.purpose || '',
      requesterName: request.requesterName || ''
    };

    if (!saveRecords([...records, record])) {
      return;
    }
    if (!updateRequestStatus(request.id, 'Confirmed')) {
      // Roll back the assignment so the two lists stay consistent.
      saveRecords(records.filter((savedRecord) => savedRecord.id !== record.id));
      return;
    }

    requestFeedback.textContent = `Approved ${request.roomLabel} for ${request.requesterName || 'the requester'} on ${request.date}.`;
    renderRecords();
    renderRequests();
  }

  function rejectRequest(request) {
    if (!window.confirm(`Reject the reservation request for ${request.roomLabel} on ${request.date}?`)) {
      return;
    }
    if (updateRequestStatus(request.id, 'Rejected')) {
      requestFeedback.textContent = `Rejected the request for ${request.roomLabel}.`;
      renderRequests();
    }
  }

  function renderRequests() {
    requestList.replaceChildren();
    const pending = requests.filter((request) => (request.status || 'Pending Review') === 'Pending Review');
    requestCount.textContent = String(pending.length);

    if (!requests.length) {
      const empty = document.createElement('p');
      empty.className = 'assignment-empty';
      empty.textContent = 'No reservation requests have been submitted yet.';
      requestList.append(empty);
      return;
    }

    // Pending first, then reviewed; each group ordered by date and time.
    const sortedRequests = [...requests].sort((left, right) => {
      const leftPending = (left.status || 'Pending Review') === 'Pending Review' ? 0 : 1;
      const rightPending = (right.status || 'Pending Review') === 'Pending Review' ? 0 : 1;
      return leftPending - rightPending ||
        String(left.date).localeCompare(String(right.date)) ||
        String(left.startTime).localeCompare(String(right.startTime));
    });

    sortedRequests.forEach((request) => {
      const status = request.status || 'Pending Review';
      const item = document.createElement('article');
      item.className = 'assignment-record request-record';
      item.dataset.status = status.toLowerCase().replace(/\s+/g, '-');

      const copy = document.createElement('div');
      copy.className = 'assignment-record-copy';
      const title = document.createElement('strong');
      title.textContent = `${request.roomLabel} · ${request.buildingName || request.buildingId}`;
      const when = document.createElement('span');
      when.textContent = `${request.floorLabel || `Floor ${request.floorId}`} · ${request.date} · ${window.RoomQTime.format(request.startTime)}–${window.RoomQTime.format(request.endTime)}`;
      const who = document.createElement('span');
      who.textContent = `${request.requesterName || 'Unknown requester'}${request.studentId ? ` (${request.studentId})` : ''} · ${request.purpose || 'Study / Class'}`;
      copy.append(title, when, who);

      const actions = document.createElement('div');
      actions.className = 'request-actions';

      if (status === 'Pending Review') {
        const approveButton = document.createElement('button');
        approveButton.type = 'button';
        approveButton.className = 'request-approve';
        approveButton.textContent = 'Approve';
        approveButton.setAttribute('aria-label', `Approve request for ${request.roomLabel} on ${request.date}`);
        approveButton.addEventListener('click', () => approveRequest(request));

        const rejectButton = document.createElement('button');
        rejectButton.type = 'button';
        rejectButton.className = 'request-reject';
        rejectButton.textContent = 'Reject';
        rejectButton.setAttribute('aria-label', `Reject request for ${request.roomLabel} on ${request.date}`);
        rejectButton.addEventListener('click', () => rejectRequest(request));

        actions.append(approveButton, rejectButton);
      } else {
        const pill = document.createElement('span');
        pill.className = `request-status-pill is-${item.dataset.status}`;
        pill.textContent = status;
        actions.append(pill);
      }

      item.append(copy, actions);
      requestList.append(item);
    });
  }

  function saveAssignment(event) {
    event.preventDefault();
    if (!storageReady) {
      feedback.textContent = 'Assignments cannot be saved because browser storage is unavailable.';
      return;
    }

    const building = getBuilding(buildingSelect.value);
    const floor = getFloor(building, floorSelect.value);
    const regionIndex = floor
      ? floor.regions.findIndex((region) => region.id === roomSelect.value)
      : -1;
    const region = floor && floor.regions[regionIndex];
    if (!building || !floor || !region) {
      feedback.textContent = 'Select a building, floor, and room before saving.';
      return;
    }

    const date = dateInput.value;
    const startTime = startInput.value;
    const endTime = endInput.value;
    if (!date || !startTime || !endTime) {
      feedback.textContent = 'Enter a date and choose both start and end times.';
      return;
    }
    if (startTime >= endTime) {
      feedback.textContent = 'The end time must be later than the start time.';
      return;
    }

    const overlaps = records.some((record) =>
      record.buildingId === building.id &&
      record.floorId === floor.id &&
      record.regionId === region.id &&
      record.date === date &&
      startTime < record.endTime &&
      endTime > record.startTime
    );
    if (overlaps) {
      feedback.textContent = 'This room already has an overlapping assignment on that date.';
      return;
    }

    const roomNumber = getRoomNumber(floor, regionIndex, region);
    const roomLabel = getRoomLabel(floor, regionIndex, region);
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      buildingId: building.id,
      floorId: floor.id,
      regionId: region.id,
      roomNumber,
      roomName: region.name || '',
      roomLabel,
      date,
      startTime,
      endTime
    };

    if (saveRecords([...records, record])) {
      feedback.textContent = `Saved ${roomLabel} for ${date}, ${window.RoomQTime.format(startTime)}–${window.RoomQTime.format(endTime)}.`;
      renderRecords();
      form.reset();
      dateInput.value = localDate;
      updateFloors();
      startTimePicker.setValue('');
      endTimePicker.setValue('');
    }
  }

  if (!Array.isArray(buildings) || !buildings.length) {
    feedback.textContent = 'Classroom layout data is unavailable; assignments cannot be created.';
    submitButton.disabled = true;
    return;
  }

  buildings.forEach((building) => {
    buildingSelect.append(new Option(building.name, building.id));
  });
  buildingSelect.addEventListener('change', updateFloors);
  floorSelect.addEventListener('change', updateRooms);
  roomSelect.addEventListener('change', renderFloorPlan);
  form.addEventListener('submit', saveAssignment);
  window.addEventListener('resize', renderFloorPlan);

  records = loadRecords();
  renderRecords();
  requests = loadRequests();
  renderRequests();

  window.addEventListener('storage', (event) => {
    if (event.key === requestStorageKey || event.key === null) {
      requests = loadRequests();
      renderRequests();
    }
    if (event.key !== storageKey && event.key !== null) {
      return;
    }
    records = loadRecords();
    renderRecords();
  });
});
