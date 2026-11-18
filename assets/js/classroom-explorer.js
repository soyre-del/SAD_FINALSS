document.addEventListener('DOMContentLoaded', () => {
  const sourceWidth = 415;
  const sourceHeight = 562;
  const floor = (id, label, crop, regions, staffRooms = [], roomOverrides = {}) => ({
    id,
    label,
    crop: { x: crop[0], y: crop[1], width: crop[2], height: crop[3] },
    regions: regions.map(([x, y, width, height], index) => ({
      id: `${id}-region-${index + 1}`,
      x,
      y,
      width,
      height,
      ...(roomOverrides[index] || {})
    })),
    staffRooms: staffRooms.map(([x, y, width, height]) => ({ x, y, width, height }))
  });

  // Coordinates match the blue and green blocks in the supplied, unchanged layout image.
  const buildings = [
    {
      id: 'cas',
      name: 'CAS Building',
      floors: [
        {
          ...floor('3', '3rd Floor', [8, 34, 140, 53], [
            [34, 43, 16, 14], [52, 43, 16, 14], [71, 43, 15, 14],
            [89, 43, 15, 14], [107, 43, 15, 14], [125, 43, 16, 14],
            [16, 66, 34, 13], [52, 66, 16, 13], [89, 66, 15, 13],
            [107, 66, 15, 13], [125, 66, 16, 13]
          ], [
            [16, 43, 15, 14]
          ], {
            6: { roomNumber: null, name: 'Speech Lab' },
            7: { roomNumber: 310 },
            9: { roomNumber: 308 },
            10: { roomNumber: 307 }
          })
        },
        {
          ...floor('4', '4th Floor', [8, 88, 140, 55], [
            [16, 116, 34, 13], [52, 116, 34, 13],
            [89, 116, 34, 13], [125, 116, 16, 13]
          ], [
            [16, 93, 106, 14]
          ], {
            0: { name: 'IRS Main' },
            1: { name: 'Skylab 2' },
            2: { name: 'Sky Lab 1' },
            3: { name: 'NORSU Development Center' }
          })
        }
      ]
    },
    {
      id: 'cba',
      name: 'CBA Building',
      floors: [
        {
          ...floor('1', '1st Floor', [5, 369, 143, 29], [
            [109, 374, 29, 13]
          ], [
            [13, 374, 77, 13]
          ])
        },
        {
          ...floor('2', '2nd Floor', [5, 398, 143, 35], [
            [63, 401, 34, 13], [13, 423, 22, 14],
            [90, 423, 22, 14], [116, 423, 22, 14]
          ], [
            [13, 401, 47, 13], [100, 401, 38, 13], [39, 423, 22, 14]
          ])
        },
        {
          ...floor('3', '3rd Floor', [5, 436, 143, 51], [
            [63, 444, 22, 13], [89, 444, 23, 13], [115, 444, 23, 13],
            [13, 466, 22, 14], [39, 466, 22, 14],
            [90, 466, 22, 14], [116, 466, 22, 14]
          ], [
            [13, 444, 47, 13]
          ])
        }
      ]
    },
    {
      id: 'cthm',
      name: 'CTHM Building',
      floors: [
        {
          ...floor('1', '1st Floor', [8, 197, 140, 31], [
            [16, 203, 106, 13]
          ], [
            [125, 203, 16, 13]
          ])
        },
        {
          ...floor('2', '2nd Floor', [8, 232, 140, 31], [
            [37, 239, 18, 13], [59, 239, 18, 13],
            [80, 239, 18, 13], [101, 239, 19, 14]
          ], [
            [16, 239, 18, 13]
          ])
        },
        {
          ...floor('3', '3rd Floor', [8, 266, 140, 31], [
            [16, 272, 13, 13], [32, 272, 13, 13],
            [48, 272, 13, 13], [64, 272, 13, 13],
            [80, 272, 13, 13], [96, 272, 13, 13],
            [111, 272, 14, 13], [127, 272, 14, 13]
          ])
        }
      ]
    },
    {
      id: 'cnpahs',
      name: 'CNPAHS Building',
      floors: [
        {
          ...floor('1', '1st Floor', [233, 30, 140, 39], [
            [238, 38, 34, 13], [275, 38, 34, 13],
            [311, 38, 34, 13], [348, 38, 15, 13]
          ])
        },
        {
          ...floor('2', '2nd Floor', [233, 72, 140, 33], [
            [238, 80, 16, 14], [257, 80, 15, 14], [275, 80, 15, 14],
            [293, 80, 16, 14], [330, 80, 15, 14]
          ], [
            [348, 80, 15, 14]
          ])
        },
        {
          ...floor('3', '3rd Floor', [233, 107, 140, 32], [
            [238, 115, 28, 13], [269, 115, 28, 13],
            [300, 115, 28, 13], [348, 115, 15, 13]
          ])
        }
      ]
    },
    {
      id: 'cit',
      name: 'CIT Building',
      floors: [
        {
          ...floor('1', '1st Floor', [233, 262, 142, 48], [
            [239, 267, 9, 13], [250, 267, 8, 13], [260, 267, 9, 13],
            [271, 267, 8, 13], [281, 267, 9, 13], [292, 267, 8, 13],
            [303, 267, 7, 14], [326, 267, 8, 13], [335, 267, 8, 13],
            [345, 267, 7, 13], [354, 267, 8, 13], [354, 289, 8, 13]
          ])
        },
        {
          ...floor('2', '2nd Floor', [233, 195, 142, 63], [
            [239, 199, 11, 13], [252, 199, 10, 13], [265, 199, 10, 13],
            [277, 199, 11, 13], [290, 199, 10, 13], [303, 199, 10, 13],
            [326, 199, 8, 13], [335, 199, 8, 13], [345, 199, 7, 13],
            [354, 199, 8, 13], [253, 225, 11, 13], [336, 241, 27, 13]
          ], [
            [237, 241, 27, 13]
          ])
        }
      ]
    },
    {
      id: 'st',
      name: 'ST Building',
      floors: [
        {
          ...floor('1', '1st Floor', [234, 342, 141, 27], [
            [272, 352, 28, 13], [304, 352, 28, 13]
          ], [
            [241, 352, 27, 13], [336, 352, 28, 13]
          ])
        },
        {
          ...floor('2', '2nd Floor', [234, 370, 141, 22], [
            [241, 374, 28, 13], [273, 374, 28, 13], [305, 374, 27, 13]
          ], [
            [337, 374, 27, 13]
          ])
        },
        {
          ...floor('3', '3rd Floor', [234, 394, 141, 20], [
            [241, 395, 22, 14], [266, 395, 22, 14], [292, 395, 21, 14],
            [317, 395, 22, 14], [342, 395, 22, 14]
          ])
        },
        {
          ...floor('4', '4th Floor', [234, 414, 141, 20], [
            [241, 417, 22, 14], [267, 417, 21, 14], [292, 417, 22, 14],
            [317, 417, 22, 14], [342, 417, 22, 14]
          ])
        }
      ]
    },
    {
      id: 'cted',
      name: 'CTED Building',
      floors: [
        {
          ...floor('2', '2nd Floor', [234, 483, 141, 78], [
            [275, 494, 28, 14], [307, 494, 27, 14],
            [338, 494, 28, 14], [243, 512, 28, 14], [243, 530, 27, 13]
          ], [
            [244, 494, 27, 14]
          ])
        }
      ]
    }
  ];

  window.RoomQ = window.RoomQ || {};
  window.RoomQ.buildings = buildings;
  window.RoomQ.floorPlanSource = { width: sourceWidth, height: sourceHeight };
  if (!document.getElementById('buildingSelector')) {
    return;
  }

  const buildingSelector = document.getElementById('buildingSelector');
  const floorSelector = document.getElementById('floorSelector');
  const floorPlanHeading = document.getElementById('floorPlanHeading');
  const floorPlanEmpty = document.getElementById('floorPlanEmpty');
  const layoutEmptyTitle = document.getElementById('layoutEmptyTitle');
  const layoutEmptyCopy = document.getElementById('layoutEmptyCopy');
  const detailsBuilding = document.getElementById('detailsBuilding');
  const detailsFloor = document.getElementById('detailsFloor');
  const detailsCategory = document.getElementById('detailsCategory');
  const detailsCapacity = document.getElementById('detailsCapacity');
  const detailsFacilities = document.getElementById('detailsFacilities');
  const detailsStatus = document.getElementById('detailsStatus');
  const detailsStatusDot = document.getElementById('detailsStatusDot');
  const selectedRoomName = document.getElementById('selectedRoomName');
  const roomSelectionDescription = document.getElementById('roomSelectionDescription');
  const scheduleEmpty = document.getElementById('scheduleEmpty');
  const availabilityDate = document.getElementById('availabilityDate');
  const availabilityTime = document.getElementById('availabilityTime');
  const availabilityTimePicker = window.RoomQTime.attach(
    document.getElementById('availabilityTimePicker'),
    availabilityTime
  );
  const availabilityNote = document.getElementById('availabilityNote');
  const floorPlanCanvas = document.getElementById('floorPlanCanvas');
  const planStage = document.getElementById('planStage');
  const planSourceLayer = document.getElementById('planSourceLayer');
  const roomOverlayLayer = document.getElementById('roomOverlayLayer');
  const canvasCaption = document.getElementById('canvasCaption');
  const zoomLevel = document.getElementById('zoomLevel');
  const zoomOutButton = document.getElementById('zoomOutButton');
  const zoomInButton = document.getElementById('zoomInButton');
  const fitPlanButton = document.getElementById('fitPlanButton');

  const roomUseStorageKey = 'roomq.roomUsage.v1';
  let currentBuilding = null;
  let currentFloor = null;
  let selectedRegionId = null;
  let roomUseRecords = [];
  let roomUseStorageReady = true;
  let fitScale = 1;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let dragState = null;

  for (const building of buildings) {
    const option = document.createElement('option');
    option.value = building.id;
    option.textContent = building.name;
    buildingSelector.append(option);
  }
  buildingSelector.value = buildings[0].id;

  const localDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  const now = new Date();
  availabilityDate.value = localDate;
  availabilityTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  availabilityTimePicker.setValue(availabilityTime.value);
  roomUseRecords = loadRoomUseRecords();

  function getSelectedBuilding() {
    return buildings.find((building) => building.id === buildingSelector.value);
  }

  function isValidRoomUseRecord(record) {
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

  function loadRoomUseRecords() {
    roomUseStorageReady = true;
    try {
      const savedRecords = window.localStorage.getItem(roomUseStorageKey);
      if (savedRecords === null) {
        return [];
      }

      const parsedRecords = JSON.parse(savedRecords);
      if (!Array.isArray(parsedRecords) || parsedRecords.some((record) => !isValidRoomUseRecord(record))) {
        throw new Error('Saved room-use data has an invalid format.');
      }
      return parsedRecords;
    } catch (error) {
      roomUseStorageReady = false;
      console.error('Unable to load saved room-use data.', error);
      return [];
    }
  }

  function findRoomUse(regionId, date = availabilityDate.value, time = availabilityTime.value) {
    if (!currentBuilding || !currentFloor || !date || !time) {
      return null;
    }

    return roomUseRecords.find((record) =>
      record.buildingId === currentBuilding.id &&
      record.floorId === currentFloor.id &&
      record.regionId === regionId &&
      record.date === date &&
      record.startTime <= time &&
      time < record.endTime
    ) || null;
  }

  function setStatusClasses(element, status) {
    element.classList.toggle('is-available', status === 'available');
    element.classList.toggle('is-unavailable', status === 'unavailable');
    element.classList.toggle('is-unknown', status === 'unknown');
  }

  function updateSelectedRoomStatus() {
    if (!currentFloor || !selectedRegionId) {
      return;
    }

    const region = currentFloor.regions.find((item) => item.id === selectedRegionId);
    if (!region) {
      return;
    }

    const usage = findRoomUse(region.id);
    const hasDateAndTime = Boolean(availabilityDate.value && availabilityTime.value);
    const status = !roomUseStorageReady || !hasDateAndTime
      ? 'unknown'
      : usage
        ? 'unavailable'
        : 'available';

    if (status === 'unavailable') {
      detailsStatus.textContent = `Not available · in use until ${window.RoomQTime.format(usage.endTime)}`;
    } else if (status === 'available') {
      detailsStatus.textContent = `Available at ${window.RoomQTime.format(availabilityTime.value)}`;
    } else {
      detailsStatus.textContent = 'Availability could not be checked';
    }
    setStatusClasses(detailsStatus, status);
    setStatusClasses(detailsStatusDot, status);
  }

  function updateAvailabilityNote() {
    if (!currentFloor) {
      availabilityNote.textContent = 'Select a building with a mapped floor to check room availability.';
      return;
    }

    const hasDateAndTime = Boolean(availabilityDate.value && availabilityTime.value);
    let unavailableCount = 0;
    roomOverlayLayer.querySelectorAll('.classroom-region-overlay').forEach((overlay) => {
      const usage = hasDateAndTime && roomUseStorageReady
        ? findRoomUse(overlay.dataset.regionId)
        : null;
      const status = !roomUseStorageReady || !hasDateAndTime
        ? 'unknown'
        : usage
          ? 'unavailable'
          : 'available';

      setStatusClasses(overlay, status);
      if (status !== 'available') {
        unavailableCount += 1;
      }

      const statusLabel = status === 'unavailable'
        ? `Not available at ${window.RoomQTime.format(availabilityTime.value)}`
        : status === 'available'
          ? `Available at ${window.RoomQTime.format(availabilityTime.value)}`
          : 'Availability could not be checked';
      overlay.title = `${overlay.dataset.roomTitle} · ${statusLabel}`;
      overlay.setAttribute('aria-label', `${overlay.dataset.roomTitle}; ${statusLabel}`);
    });

    if (!hasDateAndTime) {
      availabilityNote.textContent = 'Choose a date and time to check room availability.';
    } else if (!roomUseStorageReady) {
      availabilityNote.textContent = 'Room-use data could not be read; availability cannot be checked.';
    } else {
      const date = new Date(`${availabilityDate.value}T00:00:00`);
      const dateLabel = new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
      availabilityNote.textContent = unavailableCount === 0
        ? `All ${currentFloor.regions.length} rooms are available on ${dateLabel} at ${window.RoomQTime.format(availabilityTime.value)}.`
        : `${unavailableCount} ${unavailableCount === 1 ? 'room is' : 'rooms are'} not available on ${dateLabel} at ${window.RoomQTime.format(availabilityTime.value)}. Gray rooms are occupied.`;
    }

    updateSelectedRoomStatus();
  }

  function updateTransform() {
    planStage.style.transform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom})`;
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    zoomOutButton.disabled = !currentFloor || zoom <= 1;
    zoomInButton.disabled = !currentFloor || zoom >= 3;
    fitPlanButton.disabled = !currentFloor;
  }

  function showNoLayout(building) {
    currentFloor = null;
    selectedRegionId = null;
    roomOverlayLayer.replaceChildren();
    planStage.hidden = true;
    floorPlanEmpty.hidden = false;
    floorPlanHeading.textContent = building.name;
    layoutEmptyTitle.textContent = `${building.name} layout is not in the supplied image`;
    layoutEmptyCopy.textContent = 'Add this building’s actual floor plan to enable floor navigation and room selection. No layout or room positions will be generated.';
    canvasCaption.lastChild.textContent = 'No source layout is available for this building';
    floorSelector.replaceChildren();
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No floor layout available';
    floorSelector.append(option);
    floorSelector.disabled = true;
    zoom = 1;
    panX = 0;
    panY = 0;
    updateTransform();
    resetRoomDetails(building);
  }

  function setFloorOptions(building) {
    floorSelector.replaceChildren();
    floorSelector.disabled = building.floors.length === 0;

    for (const item of building.floors) {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      floorSelector.append(option);
    }

    if (building.floors.length) {
      floorSelector.value = building.floors[0].id;
      return building.floors[0];
    }

    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No floor layout available';
    floorSelector.append(option);
    return null;
  }

  function resetRoomDetails(building) {
    selectedRegionId = null;
    selectedRoomName.textContent = 'No classroom selected';
    roomSelectionDescription.textContent = 'Select a room region to inspect its availability.';
    detailsBuilding.textContent = building.name;
    detailsFloor.textContent = currentFloor ? currentFloor.label : 'Not available';
    detailsCategory.textContent = '—';
    detailsCapacity.textContent = 'Not connected';
    detailsFacilities.textContent = 'Not connected';
    detailsStatus.textContent = 'Select a room to check availability';
    setStatusClasses(detailsStatus, 'unknown');
    setStatusClasses(detailsStatusDot, 'unknown');
    scheduleEmpty.textContent = 'Select a room to view saved use times.';
  }

  function getRoomNumber(index, region) {
    const mappedRegion = region || currentFloor.regions[index];
    if (mappedRegion.roomNumber !== undefined) {
      return mappedRegion.roomNumber;
    }
    return Number(currentFloor.id) * 100 + index + 1;
  }

  function renderSelectedRoomSchedule(region) {
    scheduleEmpty.replaceChildren();
    const records = roomUseRecords
      .filter((record) =>
        record.buildingId === currentBuilding.id &&
        record.floorId === currentFloor.id &&
        record.regionId === region.id
      )
      .sort((left, right) =>
        left.date.localeCompare(right.date) || left.startTime.localeCompare(right.startTime)
      );

    if (!records.length) {
      scheduleEmpty.textContent = 'No room-use times are saved for this room in this browser.';
      return;
    }

    records.forEach((record) => {
      const entry = document.createElement('p');
      entry.className = 'room-use-schedule-entry';
      entry.textContent = `${record.date} · ${window.RoomQTime.format(record.startTime)}–${window.RoomQTime.format(record.endTime)}`;
      scheduleEmpty.append(entry);
    });
  }

  function selectRegion(region, index) {
    selectedRegionId = region.id;
    roomOverlayLayer.querySelectorAll('.classroom-region-overlay').forEach((overlay) => {
      overlay.classList.toggle('is-selected', overlay.dataset.regionId === region.id);
    });

    const roomNumber = getRoomNumber(index, region);
    const roomName = region.name
      ? (roomNumber === null ? region.name : `Room ${roomNumber} · ${region.name}`)
      : `Room ${roomNumber}`;
    selectedRoomName.textContent = roomName;
    roomSelectionDescription.textContent = region.name
      ? 'Named room on the selected floor plan.'
      : "Numbered by the selected floor's convention.";
    detailsBuilding.textContent = currentBuilding.name;
    detailsFloor.textContent = currentFloor.label;
    detailsCategory.textContent = 'Available room (source plan)';
    detailsCapacity.textContent = 'Not connected';
    detailsFacilities.textContent = 'Not connected';
    renderSelectedRoomSchedule(region);
    updateSelectedRoomStatus();
  }

  function renderFloor(resetView) {
    if (!currentBuilding || !currentFloor) {
      return;
    }

    if (resetView) {
      zoom = 1;
      panX = 0;
      panY = 0;
      resetRoomDetails(currentBuilding);
    }

    const crop = currentFloor.crop;
    const availableWidth = Math.max(100, floorPlanCanvas.clientWidth - 44);
    const availableHeight = Math.max(100, floorPlanCanvas.clientHeight - 52);
    fitScale = Math.min(
      availableWidth * 0.95 / crop.width,
      availableHeight * 0.95 / crop.height
    );

    planStage.hidden = false;
    floorPlanEmpty.hidden = true;
    planStage.style.width = `${crop.width * fitScale}px`;
    planStage.style.height = `${crop.height * fitScale}px`;
    planSourceLayer.style.left = `${-crop.x * fitScale}px`;
    planSourceLayer.style.top = `${-crop.y * fitScale}px`;
    planSourceLayer.style.width = `${sourceWidth * fitScale}px`;
    planSourceLayer.style.height = `${sourceHeight * fitScale}px`;
    roomOverlayLayer.style.width = `${sourceWidth * fitScale}px`;
    roomOverlayLayer.style.height = `${sourceHeight * fitScale}px`;
    floorPlanHeading.textContent = `${currentBuilding.name} · ${currentFloor.label}`;
    canvasCaption.lastChild.textContent = 'Drag to pan · Use the controls to zoom';

    roomOverlayLayer.replaceChildren();
    currentFloor.staffRooms.forEach((staffRoom) => {
      const marker = document.createElement('span');
      marker.className = 'staff-room-region';
      marker.style.left = `${staffRoom.x * fitScale}px`;
      marker.style.top = `${staffRoom.y * fitScale}px`;
      marker.style.width = `${staffRoom.width * fitScale}px`;
      marker.style.height = `${staffRoom.height * fitScale}px`;
      marker.title = 'Office / staff room (source plan)';
      marker.setAttribute('role', 'img');
      marker.setAttribute('aria-label', 'Office or staff room');
      roomOverlayLayer.append(marker);
    });

    currentFloor.regions.forEach((region, index) => {
      const overlay = document.createElement('button');
      overlay.type = 'button';
      overlay.className = 'classroom-region-overlay';
      const roomNumber = getRoomNumber(index, region);
      const roomName = region.name
        ? (roomNumber === null ? region.name : `Room ${roomNumber} · ${region.name}`)
        : `Room ${roomNumber}`;
      overlay.style.left = `${region.x * fitScale}px`;
      overlay.style.top = `${region.y * fitScale}px`;
      overlay.style.width = `${region.width * fitScale}px`;
      overlay.style.height = `${region.height * fitScale}px`;
      overlay.dataset.regionId = region.id;
      overlay.dataset.roomTitle = `${roomName} · ${currentBuilding.name} · ${currentFloor.label}`;
      overlay.textContent = region.name || (roomNumber === null ? 'Room' : String(roomNumber));
      overlay.setAttribute(
        'aria-label',
        `${currentBuilding.name}, ${currentFloor.label}, ${roomName}; capacity and schedule data unavailable`
      );
      overlay.title = `${roomName} · ${currentBuilding.name} · ${currentFloor.label}`;
      overlay.classList.toggle('is-selected', selectedRegionId === region.id);
      overlay.addEventListener('click', () => selectRegion(region, index));
      roomOverlayLayer.append(overlay);
    });

    detailsBuilding.textContent = currentBuilding.name;
    detailsFloor.textContent = currentFloor.label;
    updateTransform();
    updateAvailabilityNote();
  }

  function updateBuilding() {
    const building = getSelectedBuilding();
    if (!building) {
      return;
    }

    currentBuilding = building;
    selectedRegionId = null;
    currentFloor = setFloorOptions(building);

    if (!currentFloor) {
      showNoLayout(building);
      return;
    }

    resetRoomDetails(building);
    renderFloor(true);
  }

  function updateFloor() {
    currentFloor = currentBuilding.floors.find((item) => item.id === floorSelector.value) || null;
    if (!currentFloor) {
      return;
    }
    renderFloor(true);
  }

  function setZoom(value) {
    zoom = Math.max(1, Math.min(3, value));
    updateTransform();
  }

  buildingSelector.addEventListener('change', updateBuilding);
  floorSelector.addEventListener('change', updateFloor);
  availabilityDate.addEventListener('change', updateAvailabilityNote);
  availabilityTime.addEventListener('change', updateAvailabilityNote);
  zoomOutButton.addEventListener('click', () => setZoom(zoom - 0.25));
  zoomInButton.addEventListener('click', () => setZoom(zoom + 0.25));
  fitPlanButton.addEventListener('click', () => {
    zoom = 1;
    panX = 0;
    panY = 0;
    updateTransform();
  });

  floorPlanCanvas.addEventListener('pointerdown', (event) => {
    if (!currentFloor || event.target.closest('.classroom-region-overlay')) {
      return;
    }
    dragState = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX, panY };
    floorPlanCanvas.setPointerCapture(event.pointerId);
    floorPlanCanvas.classList.add('is-panning');
  });

  floorPlanCanvas.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }
    panX = dragState.panX + event.clientX - dragState.x;
    panY = dragState.panY + event.clientY - dragState.y;
    updateTransform();
  });

  function stopPanning(event) {
    if (dragState && dragState.pointerId === event.pointerId) {
      dragState = null;
      floorPlanCanvas.classList.remove('is-panning');
    }
  }

  floorPlanCanvas.addEventListener('pointerup', stopPanning);
  floorPlanCanvas.addEventListener('pointercancel', stopPanning);
  floorPlanCanvas.addEventListener('wheel', (event) => {
    if (!currentFloor) {
      return;
    }
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });

  window.addEventListener('resize', () => {
    if (currentFloor) {
      renderFloor(false);
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== roomUseStorageKey && event.key !== null) {
      return;
    }

    roomUseRecords = loadRoomUseRecords();
    updateAvailabilityNote();
    if (selectedRegionId && currentFloor) {
      const region = currentFloor.regions.find((item) => item.id === selectedRegionId);
      if (region) {
        renderSelectedRoomSchedule(region);
      }
    }
  });

  updateAvailabilityNote();
  updateBuilding();
});
