export const dayparts = Object.freeze({
  morning:Object.freeze({id:'morning',dishId:'kahvalti',title:'morningTitle',light:'morningLight',range:'05:00–11:00'}),
  day:Object.freeze({id:'day',dishId:'tavuk-sis',title:'dayTitle',light:'dayLight',range:'11:00–17:00'}),
  evening:Object.freeze({id:'evening',dishId:'tavuk-izgara',title:'eveningTitle',light:'eveningLight',range:'17:00–05:00'}),
});

export function daypartChoice(value) {
  return Object.hasOwn(dayparts,value) ? value : 'auto';
}

export function gazipasaHour(date = new Date()) {
  if (!Number.isFinite(date.getTime())) return 12;
  try {
    return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',hourCycle:'h23'}).format(date));
  } catch {
    return (date.getUTCHours() + 3) % 24;
  }
}

export function daypartFor(date = new Date(), choice = 'auto') {
  if (daypartChoice(choice) !== 'auto') return dayparts[choice];
  const hour = gazipasaHour(date);
  return dayparts[hour >= 5 && hour < 11 ? 'morning' : hour >= 11 && hour < 17 ? 'day' : 'evening'];
}

export function daypartPhoto(period, width = 1280) {
  return `assets/daypart/${Object.hasOwn(dayparts,period.id) ? period.id : 'day'}-${width === 640 ? 640 : 1280}.webp`;
}

// Recheck at the next whole minute and on tab restoration; do not rebuild a
// guest's menu, open dish, or basket when the featured meal changes.
export function createDaypartClock({onChange,choice='auto',now=()=>new Date(),setTimer=setTimeout,clearTimer=clearTimeout}) {
  let selected = daypartChoice(choice);
  let current;
  let timer;
  let stopped = false;
  function refresh(force = false) {
    if (stopped) return;
    clearTimer(timer);
    const date = now();
    const next = daypartFor(date,selected);
    if (force || next !== current) {
      current = next;
      onChange(next);
    }
    const elapsed = Number.isFinite(date.getTime()) ? date.getUTCSeconds() * 1000 + date.getUTCMilliseconds() : 0;
    timer = setTimer(refresh,60000 - elapsed);
  }
  refresh();
  return {
    refresh,
    select(value) { selected = daypartChoice(value); refresh(true); },
    stop() { stopped = true; clearTimer(timer); },
  };
}
