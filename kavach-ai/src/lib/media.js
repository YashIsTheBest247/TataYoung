// Real Unsplash CDN URLs for Indian monsoon and flood imagery.
// Unsplash license allows free commercial use with attribution encouraged.

const u = (id, w = 1200, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

// Mumbai monsoon and India rain street scenes.
export const FLOOD = {
  streetFlood1: u('1566552881560-0be862a7c445'),  // Mumbai monsoon
  streetFlood2: u('1529253355930-ddbe423a2ac7'),  // Mumbai in rain
  streetFlood3: u('1591688497614-6691510da903'),  // Mumbai monsoon
  streetFlood4: u('1600721946649-e26bc4424d9d'),  // Indian street rain
  streetFlood5: u('1640558817252-f6139cbd2853'),  // India rain
  streetFlood6: u('1679180642283-13b5d793d23a'),  // India rain
  streetFlood7: u('1659370427925-5d40b64689b0'),  // Mumbai monsoon
  streetFlood8: u('1720632644002-3a883fcd79a8'),  // Mumbai monsoon
};

// Rescue and relief imagery (helicopter + volunteer action).
export const RESCUE = {
  heli1: u('1563561686990-f0ef5b3e0b7c'),
  heli2: u('1679180641689-9f627cf34d02'),  // India rain neighbourhood
  heli3: u('1679180643390-7890d1685054'),  // India rain street
  heli4: u('1658669201219-bb3fefc01891'),  // India rain scene
};

export const IMAGES = { ...FLOOD, ...RESCUE };

export const sized = (url, { w = 1200, q = 70 } = {}) => {
  if (!url.includes('images.unsplash.com')) return url;
  return url.replace(/w=\d+/, `w=${w}`).replace(/q=\d+/, `q=${q}`);
};
