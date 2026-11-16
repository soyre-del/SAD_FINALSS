/**
 * RoomQ - User Portal (Student & Faculty Side) Engine
 * Handles real-time classroom availability, smart filtering, interactive map links,
 * schedule lookups, and conflict-checked booking requests.
 */

document.addEventListener('DOMContentLoaded', () => {
  const roomUseStorageKey = 'roomq.roomUsage.v1';
  const roomRequestStorageKey = 'roomq.roomRequests.v1';
  const userProfileStorageKey = 'roomq.userProfile.v1';

  // State
  let allRooms = [];
  let roomUseRecords = [];
  let userRequests = [];
  let selectedBuilding = 'all';
  let selectedStatus = 'all';
  let selectedType = 'all';
  let sortOrder = 'default';
  let searchQuery = '';

  // Elements
  const roomGrid = document.getElementById('userRoomGrid');
  const emptyState = document.getElementById('userEmptyState');
  const resultsCount = document.getElementById('resultsCount');
  const searchInput = document.getElementById('userSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('userSortSelect');
  const currentTimeDisplay = document.getElementById('userLiveTimeDisplay');

  // Stats Elements
  const statAvailable = document.getElementById('userStatAvailable');
  const statOccupied = document.getElementById('userStatOccupied');
  const statTotal = document.getElementById('userStatTotal');
  const statRequests = document.getElementById('userStatRequests');

  // Modal Elements
  const modalOverlay = document.getElementById('reservationModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const reservationForm = document.getElementById('reservationForm');
  const modalAlert = document.getElementById('modalAlert');
  const modalBuildingSelect = document.getElementById('resBuilding');
  const modalFloorSelect = document.getElementById('resFloor');
  const modalRoomSelect = document.getElementById('resRoom');
  const modalDateInput = document.getElementById('resDate');
  const modalStartInput = document.getElementById('resStartTime');
  const modalEndInput = document.getElementById('resEndTime');
  const modalRequesterInput = document.getElementById('resRequester');
  const modalIdInput = document.getElementById('resIdNumber');

  // Requests Container
  const requestsList = document.getElementById('userRequestsList');
  const requestsEmpty = document.getElementById('userRequestsEmpty');

  // Schedule Modal Elements
  const scheduleModal = document.getElementById('scheduleModal');
  const scheduleModalClose = document.getElementById('scheduleModalClose');
  const scheduleModalTitle = document.getElementById('scheduleModalTitle');
  const scheduleModalContent = document.getElementById('scheduleModalContent');

  // Toast Container
  const toastContainer = document.getElementById('roomqToastContainer');

  // Initialize
  initLiveClock();
  loadData();
  buildRoomCatalog();
  loadSavedUserProfile();
  setupFilterHandlers();
  setupModalHandlers();
  setupReservationForm();
  renderRequests();
  updateView();

  // Listen for storage changes from Admin side
  window.addEventListener('storage', (e) => {
    if (e.key === roomUseStorageKey || e.key === roomRequestStorageKey || e.key === null) {
      loadData();
      updateView();
      renderRequests();
    }
  });

  // Refresh availability every 30 seconds
  setInterval(() => {
    updateView();
  }, 30000);

  function initLiveClock() {
    const updateClock = () => {
      const now = new Date();
      if (currentTimeDisplay) {
        currentTimeDisplay.textContent = now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    };
    updateClock();
    setInterval(updateClock, 1000);

    const todayDateEl = document.getElementById('todayDate');
    if (todayDateEl) {
      const now = new Date();
      todayDateEl.textContent = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `roomq-toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-size: 1.1rem; color: ${type === 'success' ? '#10b981' : '#ef4444'};">${icon}</span> <span>${message}</span>`;
    toastContainer.append(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  function loadSavedUserProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(userProfileStorageKey));
      if (profile) {
        if (modalRequesterInput && profile.name) modalRequesterInput.value = profile.name;
        if (modalIdInput && profile.id) modalIdInput.value = profile.id;
      }
    } catch (e) {}
  }

  function saveUserProfile(name, id) {
    try {
      localStorage.setItem(userProfileStorageKey, JSON.stringify({ name, id }));
    } catch (e) {}
  }

  function loadData() {
    try {
      const savedUsage = window.localStorage.getItem(roomUseStorageKey);
      roomUseRecords = savedUsage ? JSON.parse(savedUsage) : [];
      if (!Array.isArray(roomUseRecords)) roomUseRecords = [];
    } catch (err) {
      console.error('Error reading room usage data', err);
      roomUseRecords = [];
    }

    try {
      const savedReqs = window.localStorage.getItem(roomRequestStorageKey);
      userRequests = savedReqs ? JSON.parse(savedReqs) : [];
      if (!Array.isArray(userRequests)) userRequests = [];
    } catch (err) {
      console.error('Error reading room requests', err);
      userRequests = [];
    }
  }

  function saveRequests(newRequests) {
    try {
      window.localStorage.setItem(roomRequestStorageKey, JSON.stringify(newRequests));
      userRequests = newRequests;
      renderRequests();
      updateStats();
      return true;
    } catch (err) {
      console.error('Error saving room request', err);
      return false;
    }
  }

  function getBuildings() {
    if (window.RoomQ && Array.isArray(window.RoomQ.buildings) && window.RoomQ.buildings.length) {
      return window.RoomQ.buildings;
    }
    // Fallback standard NORSU buildings definition if explorer script wasn't loaded
    return [
      { id: 'cas', name: 'CAS Building', floors: [
        { id: '3', label: '3rd Floor', regions: [
          { id: '3-region-1', name: 'Room 301' }, { id: '3-region-2', name: 'Room 302' },
          { id: '3-region-3', name: 'Room 303' }, { id: '3-region-4', name: 'Room 304' },
          { id: '3-region-5', name: 'Room 305' }, { id: '3-region-6', name: 'Room 306' },
          { id: '3-region-7', name: 'Speech Lab' }, { id: '3-region-8', name: 'Room 310' },
          { id: '3-region-9', name: 'Room 308' }, { id: '3-region-10', name: 'Room 307' }
        ]},
        { id: '4', label: '4th Floor', regions: [
          { id: '4-region-1', name: 'IRS Main' }, { id: '4-region-2', name: 'Skylab 2' },
          { id: '4-region-3', name: 'Sky Lab 1' }, { id: '4-region-4', name: 'NORSU Dev Center' }
        ]}
      ]},
      { id: 'cba', name: 'CBA Building', floors: [
        { id: '1', label: '1st Floor', regions: [{ id: '1-region-1', name: 'Room 101' }] },
        { id: '2', label: '2nd Floor', regions: [
          { id: '2-region-1', name: 'Room 201' }, { id: '2-region-2', name: 'Room 202' },
          { id: '2-region-3', name: 'Room 203' }, { id: '2-region-4', name: 'Room 204' }
        ]},
        { id: '3', label: '3rd Floor', regions: [
          { id: '3-region-1', name: 'Room 301' }, { id: '3-region-2', name: 'Room 302' },
          { id: '3-region-3', name: 'Room 303' }, { id: '3-region-4', name: 'Room 304' },
          { id: '3-region-5', name: 'Room 305' }, { id: '3-region-6', name: 'Room 306' },
          { id: '3-region-7', name: 'Room 307' }
        ]}
      ]},
      { id: 'cthm', name: 'CTHM Building', floors: [
        { id: '1', label: '1st Floor', regions: [{ id: '1-region-1', name: 'Room 101' }] },
        { id: '2', label: '2nd Floor', regions: [
          { id: '2-region-1', name: 'Room 201' }, { id: '2-region-2', name: 'Room 202' },
          { id: '2-region-3', name: 'Room 203' }, { id: '2-region-4', name: 'Room 204' }
        ]},
        { id: '3', label: '3rd Floor', regions: [
          { id: '3-region-1', name: 'Room 301' }, { id: '3-region-2', name: 'Room 302' },
          { id: '3-region-3', name: 'Room 303' }, { id: '3-region-4', name: 'Room 304' },
          { id: '3-region-5', name: 'Room 305' }, { id: '3-region-6', name: 'Room 306' },
          { id: '3-region-7', name: 'Room 307' }, { id: '3-region-8', name: 'Room 308' }
        ]}
      ]},
      { id: 'cnpahs', name: 'CNPAHS Building', floors: [
        { id: '1', label: '1st Floor', regions: [
          { id: '1-region-1', name: 'Room 101' }, { id: '1-region-2', name: 'Room 102' },
          { id: '1-region-3', name: 'Room 103' }, { id: '1-region-4', name: 'Room 104' }
        ]},
        { id: '2', label: '2nd Floor', regions: [
          { id: '2-region-1', name: 'Room 201' }, { id: '2-region-2', name: 'Room 202' },
          { id: '2-region-3', name: 'Room 203' }, { id: '2-region-4', name: 'Room 204' },
          { id: '2-region-5', name: 'Room 205' }
        ]},
        { id: '3', label: '3rd Floor', regions: [
          { id: '3-region-1', name: 'Room 301' }, { id: '3-region-2', name: 'Room 302' },
          { id: '3-region-3', name: 'Room 303' }, { id: '3-region-4', name: 'Room 304' }
        ]}
      ]},
      { id: 'cit', name: 'CIT Building', floors: [
        { id: '1', label: '1st Floor', regions: [
          { id: '1-region-1', name: 'Room 101' }, { id: '1-region-2', name: 'Room 102' },
          { id: '1-region-3', name: 'Room 103' }, { id: '1-region-4', name: 'Room 104' },
          { id: '1-region-5', name: 'Room 105' }, { id: '1-region-6', name: 'Room 106' },
          { id: '1-region-7', name: 'Room 107' }, { id: '1-region-8', name: 'Room 108' },
          { id: '1-region-9', name: 'Room 109' }, { id: '1-region-10', name: 'Room 110' },
          { id: '1-region-11', name: 'Room 111' }, { id: '1-region-12', name: 'Room 112' }
        ]},
        { id: '2', label: '2nd Floor', regions: [
          { id: '2-region-1', name: 'Room 201' }, { id: '2-region-2', name: 'Room 202' },
          { id: '2-region-3', name: 'Room 203' }, { id: '2-region-4', name: 'Room 204' },
          { id: '2-region-5', name: 'Room 205' }, { id: '2-region-6', name: 'Room 206' },
          { id: '2-region-7', name: 'Room 207' }, { id: '2-region-8', name: 'Room 208' },
          { id: '2-region-9', name: 'Room 209' }, { id: '2-region-10', name: 'Room 210' },
          { id: '2-region-11', name: 'Room 211' }, { id: '2-region-12', name: 'Room 212' }
        ]}
      ]},
      { id: 'st', name: 'ST Building', floors: [
        { id: '1', label: '1st Floor', regions: [{ id: '1-region-1', name: 'Room 101' }, { id: '1-region-2', name: 'Room 102' }] },
        { id: '2', label: '2nd Floor', regions: [{ id: '2-region-1', name: 'Room 201' }, { id: '2-region-2', name: 'Room 202' }, { id: '2-region-3', name: 'Room 203' }] },
        { id: '3', label: '3rd Floor', regions: [{ id: '3-region-1', name: 'Room 301' }, { id: '3-region-2', name: 'Room 302' }, { id: '3-region-3', name: 'Room 303' }, { id: '3-region-4', name: 'Room 304' }, { id: '3-region-5', name: 'Room 305' }] },
        { id: '4', label: '4th Floor', regions: [{ id: '4-region-1', name: 'Room 401' }, { id: '4-region-2', name: 'Room 402' }, { id: '4-region-3', name: 'Room 403' }, { id: '4-region-4', name: 'Room 404' }, { id: '4-region-5', name: 'Room 405' }] }
      ]},
      { id: 'cted', name: 'CTED Building', floors: [
        { id: '2', label: '2nd Floor', regions: [
          { id: '2-region-1', name: 'Room 201' }, { id: '2-region-2', name: 'Room 202' },
          { id: '2-region-3', name: 'Room 203' }, { id: '2-region-4', name: 'Room 204' },
          { id: '2-region-5', name: 'Room 205' }
        ]}
      ]}
    ];
  }

  function getRoomNumber(floor, index, region) {
    if (region.roomNumber !== undefined) {
      return region.roomNumber;
    }
    return Number(floor.id) * 100 + index + 1;
  }

  function getRoomLabel(floor, index, region) {
    const num = getRoomNumber(floor, index, region);
    if (region.name) {
      return num === null ? region.name : `Room ${num} · ${region.name}`;
    }
    return `Room ${num}`;
  }

  function buildRoomCatalog() {
    const buildings = getBuildings();
    allRooms = [];

    buildings.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.regions.forEach((region, index) => {
          const roomLabel = getRoomLabel(floor, index, region);
          const isLab = /lab|skylab|irs/i.test(roomLabel);
          const type = isLab ? 'Laboratory' : 'Lecture Room';
          const capacity = isLab ? 35 : (index % 2 === 0 ? 45 : 50);

          allRooms.push({
            id: region.id,
            buildingId: building.id,
            buildingName: building.name,
            floorId: floor.id,
            floorLabel: floor.label,
            regionId: region.id,
            roomLabel: roomLabel,
            type: type,
            capacity: capacity,
            facilities: isLab ? ['💻 Computers', '❄️ AC', '📽️ Projector', '📶 WiFi'] : ['🖊️ Whiteboard', '📽️ Projector', '📶 WiFi']
          });
        });
      });
    });
  }

  function getCurrentDateStr() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function getCurrentTimeStr() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  function formatTime(val) {
    if (window.RoomQTime && typeof window.RoomQTime.format === 'function') {
      return window.RoomQTime.format(val);
    }
    if (!val) return '—';
    const [h, m] = val.split(':').map(Number);
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  function getRoomActiveUsage(room, dateStr = getCurrentDateStr(), timeStr = getCurrentTimeStr()) {
    return roomUseRecords.find((rec) =>
      rec.buildingId === room.buildingId &&
      rec.floorId === room.floorId &&
      rec.regionId === room.regionId &&
      rec.date === dateStr &&
      rec.startTime <= timeStr &&
      timeStr < rec.endTime
    ) || null;
  }

  function getRoomDayRecords(room, dateStr = getCurrentDateStr()) {
    return roomUseRecords
      .filter((rec) =>
        rec.buildingId === room.buildingId &&
        rec.floorId === room.floorId &&
        rec.regionId === room.regionId &&
        rec.date === dateStr
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function setupFilterHandlers() {
    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (searchClearBtn) {
          searchClearBtn.classList.toggle('visible', Boolean(searchQuery));
        }
        updateView();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        searchClearBtn.classList.remove('visible');
        updateView();
      });
    }

    // Sort select
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortOrder = e.target.value;
        updateView();
      });
    }

    // Building pills
    document.querySelectorAll('.user-pill-btn[data-building]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.user-pill-btn[data-building]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        selectedBuilding = pill.dataset.building;
        updateView();
      });
    });

    // Status pills
    document.querySelectorAll('.user-pill-btn[data-status]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.user-pill-btn[data-status]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        selectedStatus = pill.dataset.status;
        updateView();
      });
    });

    // Type pills
    document.querySelectorAll('.user-pill-btn[data-type]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.user-pill-btn[data-type]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        selectedType = pill.dataset.type;
        updateView();
      });
    });

    // Campus map interactive building click
    document.querySelectorAll('[data-map-bldg]').forEach((el) => {
      el.addEventListener('click', () => {
        const bldg = el.dataset.mapBldg;
        const matchingPill = document.querySelector(`.user-pill-btn[data-building="${bldg}"]`);
        if (matchingPill) {
          matchingPill.click();
          const finder = document.getElementById('quick-finder');
          if (finder) finder.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function updatePillCounts() {
    const currentDate = getCurrentDateStr();
    const currentTime = getCurrentTimeStr();

    let availCount = 0;
    let occCount = 0;
    const bldgCounts = { all: allRooms.length, cas: 0, cba: 0, cthm: 0, cnpahs: 0, cit: 0, st: 0, cted: 0 };

    allRooms.forEach((room) => {
      if (bldgCounts[room.buildingId] !== undefined) {
        bldgCounts[room.buildingId] += 1;
      }
      const usage = getRoomActiveUsage(room, currentDate, currentTime);
      if (usage) {
        occCount += 1;
      } else {
        availCount += 1;
      }
    });

    // Update building pills
    document.querySelectorAll('.user-pill-btn[data-building]').forEach((pill) => {
      const bldg = pill.dataset.building;
      const countEl = pill.querySelector('.pill-count');
      if (countEl && bldgCounts[bldg] !== undefined) {
        countEl.textContent = String(bldgCounts[bldg]);
      }
    });

    // Update status pills
    const allCountEl = document.querySelector('.user-pill-btn[data-status="all"] .pill-count');
    if (allCountEl) allCountEl.textContent = String(allRooms.length);
    const availCountEl = document.querySelector('.user-pill-btn[data-status="available"] .pill-count');
    if (availCountEl) availCountEl.textContent = String(availCount);
    const occCountEl = document.querySelector('.user-pill-btn[data-status="occupied"] .pill-count');
    if (occCountEl) occCountEl.textContent = String(occCount);

    // Update global stat cards
    if (statAvailable) statAvailable.textContent = String(availCount);
    if (statOccupied) statOccupied.textContent = String(occCount);
    if (statTotal) statTotal.textContent = String(allRooms.length);
    if (statRequests) statRequests.textContent = String(userRequests.length);
  }

  function updateStats() {
    updatePillCounts();
  }

  function updateView() {
    updatePillCounts();

    const currentDate = getCurrentDateStr();
    const currentTime = getCurrentTimeStr();

    let filtered = allRooms.filter((room) => {
      // Building filter
      if (selectedBuilding !== 'all' && room.buildingId !== selectedBuilding) {
        return false;
      }

      // Status filter
      const usage = getRoomActiveUsage(room, currentDate, currentTime);
      const isAvailable = !usage;
      if (selectedStatus === 'available' && !isAvailable) {
        return false;
      }
      if (selectedStatus === 'occupied' && isAvailable) {
        return false;
      }

      // Type filter
      if (selectedType === 'lab' && !/lab|skylab|irs/i.test(room.roomLabel)) {
        return false;
      }
      if (selectedType === 'lecture' && /lab|skylab|irs/i.test(room.roomLabel)) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const fullString = `${room.roomLabel} ${room.buildingName} ${room.floorLabel} ${room.type}`.toLowerCase();
        if (!fullString.includes(searchQuery)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortOrder === 'room-asc') {
      filtered.sort((a, b) => a.roomLabel.localeCompare(b.roomLabel, undefined, { numeric: true }));
    } else if (sortOrder === 'capacity-desc') {
      filtered.sort((a, b) => b.capacity - a.capacity);
    } else if (sortOrder === 'status') {
      filtered.sort((a, b) => {
        const aAvail = !getRoomActiveUsage(a, currentDate, currentTime);
        const bAvail = !getRoomActiveUsage(b, currentDate, currentTime);
        return (bAvail ? 1 : 0) - (aAvail ? 1 : 0);
      });
    }

    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'room' : 'rooms'} found`;
    }

    renderRoomCards(filtered, currentDate, currentTime);
  }

  function renderRoomCards(rooms, currentDate, currentTime) {
    if (!roomGrid) return;
    roomGrid.replaceChildren();

    if (!rooms.length) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    rooms.forEach((room) => {
      const usage = getRoomActiveUsage(room, currentDate, currentTime);
      const isAvailable = !usage;

      const card = document.createElement('article');
      card.className = `user-room-card ${isAvailable ? 'is-available' : 'is-occupied'}`;

      // Card Header
      const head = document.createElement('div');
      head.className = 'room-card-head';

      const buildingTag = document.createElement('span');
      buildingTag.className = 'room-bldg-badge';
      buildingTag.innerHTML = `<span>⌖</span> ${room.buildingName}`;

      const statusPill = document.createElement('span');
      statusPill.className = `room-status-badge ${isAvailable ? 'available' : 'occupied'}`;
      statusPill.innerHTML = `<span class="pulse-dot"></span> ${isAvailable ? 'Available Now' : 'In Session'}`;

      head.append(buildingTag, statusPill);

      // Title & Floor info
      const titleBlock = document.createElement('div');
      titleBlock.className = 'room-main-info';

      const h3 = document.createElement('h3');
      h3.textContent = room.roomLabel;

      const loc = document.createElement('p');
      loc.className = 'room-floor-tag';
      loc.textContent = `${room.floorLabel} · ${room.type} · Capacity: ${room.capacity}`;

      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'room-spec-chips';
      room.facilities.forEach((fac) => {
        const chip = document.createElement('span');
        chip.className = 'room-spec-chip';
        chip.textContent = fac;
        tagsWrap.append(chip);
      });

      titleBlock.append(h3, loc, tagsWrap);

      // Schedule Snippet
      const scheduleSnippet = document.createElement('div');
      scheduleSnippet.className = 'room-time-banner';
      if (isAvailable) {
        const dayRecords = getRoomDayRecords(room, currentDate);
        const upcoming = dayRecords.find((rec) => rec.startTime > currentTime);
        if (upcoming) {
          scheduleSnippet.innerHTML = `<span>Free until <strong>${formatTime(upcoming.startTime)}</strong></span> <span style="color: #059669; font-weight: 700;">Open for study</span>`;
        } else {
          scheduleSnippet.innerHTML = `<span>Free for the rest of today</span> <span style="color: #059669; font-weight: 700;">Open for study</span>`;
        }
      } else {
        scheduleSnippet.innerHTML = `<span>Occupied until <strong>${formatTime(usage.endTime)}</strong></span> <span style="color: #64748b; font-weight: 700;">In session</span>`;
      }

      // Actions
      const actions = document.createElement('div');
      actions.className = 'room-card-actions';

      const scheduleBtn = document.createElement('button');
      scheduleBtn.type = 'button';
      scheduleBtn.className = 'btn-card-schedule';
      scheduleBtn.innerHTML = `<span>⏱️</span> Schedule`;
      scheduleBtn.addEventListener('click', () => {
        openScheduleModal(room);
      });

      const reserveBtn = document.createElement('button');
      reserveBtn.type = 'button';
      reserveBtn.className = 'btn-card-reserve';
      reserveBtn.innerHTML = `<span>＋</span> Request Room`;
      reserveBtn.addEventListener('click', () => {
        openReservationModal(room);
      });

      actions.append(scheduleBtn, reserveBtn);

      card.append(head, titleBlock, scheduleSnippet, actions);
      roomGrid.append(card);
    });
  }

  // Schedule Modal
  function openScheduleModal(room) {
    if (!scheduleModal) return;
    const currentDate = getCurrentDateStr();
    scheduleModalTitle.textContent = `${room.roomLabel} (${room.buildingName} · ${room.floorLabel})`;

    const records = getRoomDayRecords(room, currentDate);
    scheduleModalContent.replaceChildren();

    const infoP = document.createElement('p');
    infoP.style.margin = '0 0 14px 0';
    infoP.style.fontSize = '0.82rem';
    infoP.style.color = 'var(--roomq-muted)';
    infoP.textContent = `Showing recorded schedules for today (${currentDate}):`;
    scheduleModalContent.append(infoP);

    if (!records.length) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'user-empty-state';
      emptyMsg.style.padding = '24px';
      emptyMsg.innerHTML = `
        <div class="empty-icon" style="font-size: 1.8rem;">☕</div>
        <h4 style="margin: 0 0 4px 0; font-size: 1.05rem; color: var(--roomq-blue-strong);">No Classes Scheduled Today</h4>
        <p style="font-size: 0.8rem;">This classroom has no recorded classes or reservations today. It is completely available for study or reviews!</p>
      `;
      scheduleModalContent.append(emptyMsg);
    } else {
      const tableWrap = document.createElement('div');
      tableWrap.className = 'schedule-table-wrap';

      const table = document.createElement('table');
      table.className = 'user-schedule-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Time Slot</th>
            <th>Status</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(rec => `
            <tr>
              <td><span class="time-slot-tag">${formatTime(rec.startTime)} – ${formatTime(rec.endTime)}</span></td>
              <td><span class="room-status-badge occupied"><span class="pulse-dot"></span> Reserved / Class Session</span></td>
              <td>Class Use</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      tableWrap.append(table);
      scheduleModalContent.append(tableWrap);
    }

    const actionRow = document.createElement('div');
    actionRow.style.marginTop = '18px';
    actionRow.style.display = 'flex';
    actionRow.style.justifyContent = 'flex-end';
    actionRow.style.gap = '10px';

    const reqBtn = document.createElement('button');
    reqBtn.type = 'button';
    reqBtn.className = 'modal-submit-btn';
    reqBtn.style.padding = '10px 18px';
    reqBtn.style.fontSize = '0.8rem';
    reqBtn.innerHTML = `<span>📅</span> Request This Room`;
    reqBtn.addEventListener('click', () => {
      scheduleModal.classList.remove('open');
      openReservationModal(room);
    });

    actionRow.append(reqBtn);
    scheduleModalContent.append(actionRow);

    scheduleModal.classList.add('open');
  }

  if (scheduleModalClose) {
    scheduleModalClose.addEventListener('click', () => {
      scheduleModal.classList.remove('open');
    });
  }

  // Reservation Modal & Form
  function setupModalHandlers() {
    if (modalCloseBtn && modalOverlay) {
      modalCloseBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('open');
        clearModalAlert();
      });

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.classList.remove('open');
          clearModalAlert();
        }
      });
    }

    // Populate modal building dropdown
    if (modalBuildingSelect) {
      const buildings = getBuildings();
      modalBuildingSelect.replaceChildren(new Option('Select building', ''));
      buildings.forEach((b) => {
        modalBuildingSelect.append(new Option(b.name, b.id));
      });

      modalBuildingSelect.addEventListener('change', () => {
        updateModalFloors();
      });
    }

    if (modalFloorSelect) {
      modalFloorSelect.addEventListener('change', () => {
        updateModalRooms();
      });
    }

    if (modalDateInput) {
      modalDateInput.value = getCurrentDateStr();
    }
  }

  function updateModalFloors(selectedFloorId = '') {
    const buildings = getBuildings();
    const bId = modalBuildingSelect.value;
    const building = buildings.find((b) => b.id === bId);

    modalFloorSelect.replaceChildren(new Option('Select floor', ''));
    modalRoomSelect.replaceChildren(new Option('Select room', ''));
    modalFloorSelect.disabled = !building;
    modalRoomSelect.disabled = true;

    if (!building) return;

    building.floors.forEach((floor) => {
      const opt = new Option(floor.label, floor.id);
      if (floor.id === selectedFloorId) opt.selected = true;
      modalFloorSelect.append(opt);
    });

    if (selectedFloorId) {
      modalFloorSelect.disabled = false;
      updateModalRooms();
    }
  }

  function updateModalRooms(selectedRegionId = '') {
    const buildings = getBuildings();
    const bId = modalBuildingSelect.value;
    const fId = modalFloorSelect.value;
    const building = buildings.find((b) => b.id === bId);
    const floor = building && building.floors.find((f) => f.id === fId);

    modalRoomSelect.replaceChildren(new Option('Select room', ''));
    modalRoomSelect.disabled = !floor;
    if (!floor) return;

    floor.regions.forEach((region, index) => {
      const label = getRoomLabel(floor, index, region);
      const opt = new Option(label, region.id);
      if (region.id === selectedRegionId) opt.selected = true;
      modalRoomSelect.append(opt);
    });

    if (selectedRegionId) {
      modalRoomSelect.disabled = false;
    }
  }

  function openReservationModal(preselectRoom = null) {
    if (!modalOverlay) return;
    clearModalAlert();

    if (modalDateInput && !modalDateInput.value) {
      modalDateInput.value = getCurrentDateStr();
    }

    if (preselectRoom) {
      modalBuildingSelect.value = preselectRoom.buildingId;
      updateModalFloors(preselectRoom.floorId);
      updateModalRooms(preselectRoom.regionId);
    }

    modalOverlay.classList.add('open');
  }

  window.openRoomReservationModal = openReservationModal;

  function clearModalAlert() {
    if (modalAlert) {
      modalAlert.className = 'modal-alert';
      modalAlert.textContent = '';
    }
  }

  function showModalAlert(msg, type = 'error') {
    if (modalAlert) {
      modalAlert.className = `modal-alert show ${type}`;
      modalAlert.textContent = msg;
    }
  }

  function setupReservationForm() {
    if (!reservationForm) return;

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearModalAlert();

      const buildingId = modalBuildingSelect.value;
      const floorId = modalFloorSelect.value;
      const regionId = modalRoomSelect.value;
      const date = modalDateInput.value;
      const startTime = modalStartInput.value;
      const endTime = modalEndInput.value;
      const purpose = document.getElementById('resPurpose').value.trim();
      const requesterName = modalRequesterInput.value.trim();
      const studentId = modalIdInput.value.trim();

      if (!buildingId || !floorId || !regionId || !date || !startTime || !endTime) {
        showModalAlert('Please fill in all room scheduling fields.');
        return;
      }

      if (startTime >= endTime) {
        showModalAlert('Start time must be strictly earlier than end time.');
        return;
      }

      // Check conflict against Admin room assignments
      const conflict = roomUseRecords.find((rec) =>
        rec.buildingId === buildingId &&
        rec.floorId === floorId &&
        rec.regionId === regionId &&
        rec.date === date &&
        ((startTime >= rec.startTime && startTime < rec.endTime) ||
         (endTime > rec.startTime && endTime <= rec.endTime) ||
         (startTime <= rec.startTime && endTime >= rec.endTime))
      );

      if (conflict) {
        showModalAlert(`Schedule Conflict: This classroom is already in session (${formatTime(conflict.startTime)}–${formatTime(conflict.endTime)}) on ${date}. Please select an open slot or another room.`, 'error');
        return;
      }

      // Save user profile for convenience
      saveUserProfile(requesterName, studentId);

      // Resolve room label
      const room = allRooms.find((r) => r.buildingId === buildingId && r.floorId === floorId && r.regionId === regionId);
      const roomLabel = room ? room.roomLabel : `Room (${regionId})`;
      const buildingName = room ? room.buildingName : buildingId;

      const newRequest = {
        id: `REQ-${Date.now()}`,
        buildingId,
        buildingName,
        floorId,
        floorLabel: room ? room.floorLabel : `Floor ${floorId}`,
        regionId,
        roomLabel,
        date,
        startTime,
        endTime,
        purpose,
        requesterName,
        studentId,
        status: 'Pending Review',
        submittedAt: new Date().toISOString()
      };

      const updated = [newRequest, ...userRequests];
      if (saveRequests(updated)) {
        showModalAlert('Reservation Request submitted successfully! Academic scheduling staff will review it.', 'success');
        showToast(`Request submitted for ${roomLabel} on ${date}!`, 'success');
        setTimeout(() => {
          modalOverlay.classList.remove('open');
          reservationForm.reset();
          clearModalAlert();
          updateView();
        }, 1200);
      }
    });
  }

  function renderRequests() {
    if (!requestsList) return;
    requestsList.replaceChildren();

    if (!userRequests.length) {
      if (requestsEmpty) requestsEmpty.hidden = false;
      return;
    }

    if (requestsEmpty) requestsEmpty.hidden = true;

    userRequests.forEach((req) => {
      const item = document.createElement('div');
      item.className = 'reservation-ticket';

      const info = document.createElement('div');
      info.className = 'ticket-room-info';

      const title = document.createElement('strong');
      title.textContent = `${req.roomLabel} · ${req.buildingName}`;

      const details = document.createElement('span');
      details.textContent = `${req.date} (${formatTime(req.startTime)} – ${formatTime(req.endTime)}) · Purpose: ${req.purpose || 'Study / Class'} · Requester: ${req.requesterName} (${req.studentId || 'Student'})`;

      info.append(title, details);

      const actions = document.createElement('div');
      actions.className = 'ticket-actions';

      const badge = document.createElement('span');
      badge.className = 'ticket-status-pill';
      badge.textContent = `⏳ ${req.status || 'Pending Review'}`;

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn-ticket-cancel';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => {
        if (confirm(`Cancel reservation request for ${req.roomLabel}?`)) {
          const filtered = userRequests.filter((r) => r.id !== req.id);
          saveRequests(filtered);
          showToast(`Cancelled reservation for ${req.roomLabel}.`, 'error');
        }
      });

      actions.append(badge, cancelBtn);
      item.append(info, actions);
      requestsList.append(item);
    });
  }
});
