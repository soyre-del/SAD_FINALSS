window.RoomQTime = (() => {
  function format(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(value || '');
    if (!match) {
      return '—';
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) {
      return '—';
    }

    const hour12 = hour % 12 || 12;
    return `${hour12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  function attach(picker, valueField, initialValue) {
    const hour = picker.querySelector('[data-time-hour]');
    const minute = picker.querySelector('[data-time-minute]');
    const period = picker.querySelector('[data-time-period]');
    const addOption = (select, value, text, disabled) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      option.disabled = Boolean(disabled);
      select.append(option);
    };

    addOption(hour, '', 'Hour', true);
    for (let value = 1; value <= 12; value += 1) {
      addOption(hour, String(value), String(value));
    }

    addOption(minute, '', 'Min', true);
    for (let value = 0; value < 60; value += 1) {
      addOption(minute, String(value).padStart(2, '0'), String(value).padStart(2, '0'));
    }

    addOption(period, '', 'AM/PM', true);
    addOption(period, 'AM', 'AM');
    addOption(period, 'PM', 'PM');

    const setValue = (value) => {
      const match = /^(\d{2}):(\d{2})$/.exec(value || '');
      if (!match) {
        hour.value = '';
        minute.value = '';
        period.value = '';
        valueField.value = '';
        return;
      }

      const hour24 = Number(match[1]);
      const minuteValue = Number(match[2]);
      if (hour24 > 23 || minuteValue > 59) {
        setValue('');
        return;
      }

      hour.value = String(hour24 % 12 || 12);
      minute.value = match[2];
      period.value = hour24 >= 12 ? 'PM' : 'AM';
      valueField.value = value;
    };

    const syncValue = () => {
      if (!hour.value || !minute.value || !period.value) {
        valueField.value = '';
      } else {
        const hour12 = Number(hour.value);
        const hour24 = (hour12 % 12) + (period.value === 'PM' ? 12 : 0);
        valueField.value = `${String(hour24).padStart(2, '0')}:${minute.value}`;
      }
      valueField.dispatchEvent(new Event('change', { bubbles: true }));
    };

    picker.addEventListener('change', syncValue);
    setValue(initialValue);
    return { setValue };
  }

  return { attach, format };
})();
