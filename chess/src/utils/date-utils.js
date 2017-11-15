export function addMinutes(date, minutes){
  return addMilliseconds(date, minutes * 60000)
}

export function addMilliseconds(date, ms){
  return new Date(date.getTime() + ms)
}

export function olderThenMinutes(date, mins){
  return date.getTime() < (Date.now() - mins * 60000)
}
