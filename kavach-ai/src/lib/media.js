// Real Unsplash CDN URLs. Unsplash license allows free use including
// commercial. We query via the Unsplash image CDN with crop + format params.

const u = (id, w = 1200, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const FLOOD = {
  streetFlood1:    u('1547683905-f686c993aae5'),
  streetFlood2:    u('1600336153113-d66c79de3e91'),
  streetFlood3:    u('1485617359743-4dc5d2e53c89'),
  streetFlood4:    u('1604275689235-fdc521556c16'),
  streetFlood5:    u('1657069345471-c54f2432b79c'),
  streetFlood6:    u('1612038385745-53cfb4fbd19b'),
  streetFlood7:    u('1657069342866-2d11c2509b02'),
  streetFlood8:    u('1581059686229-de26e6ae5dc4'),
};

export const RESCUE = {
  heli1: u('1563561686990-f0ef5b3e0b7c'),
  heli2: u('1557818673-effec50525e1'),
  heli3: u('1501803524289-cf5cc17e4e67'),
  heli4: u('1534621107955-b06bbc17b043'),
};

// Composite collection for easy picking.
export const IMAGES = { ...FLOOD, ...RESCUE };

// Small helper to build cropped versions of a URL at request time.
export const sized = (url, { w = 1200, q = 70 } = {}) => {
  if (!url.includes('images.unsplash.com')) return url;
  // Replace width param.
  return url.replace(/w=\d+/, `w=${w}`).replace(/q=\d+/, `q=${q}`);
};
