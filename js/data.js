/* Everything the site shows lives here. Add a set = add a folder in media/sets and an entry below. */
window.SITE = {
  name: "Tijon",                             // artist name: header, hero, footer, tab title
  studio: "DMVDigital Studio",               // studio line under the name (change it here only)
  tagline: ["Photography", "Music Video"],

  noAi: {
    head: "No AI",
    body: "Every photograph and film on this site was shot in camera. Real people, real light, real sets."
  },

  // plays once per visit; set to null to switch the intro off. sound: true shows a "Sound on" button (the film must carry audio)
  // filmTall is the vertical cut, played instead when the screen is taller than it is wide (phones)
  // switched off until the final films are in: put this back in place of null to turn it on
  //   { film: "media/intro/intro.mp4", filmTall: "media/intro/intro_tall.mp4", sound: false }
  intro: null,

  // chrome name on the home screen: Blender-rendered frames, turned by the cursor or the phone
  hero3d: { frames: "media/intro/name/n_%02d.webp", count: 33 },

  sets: [
    {
      id: "01",
      title: "",
      frames: [
        { src: "media/sets/01/01.jpg", w: 1620, h: 1080, alt: "Portrait in red and green gel light, head down, phone to the ear" },
        { src: "media/sets/01/04.jpg", w: 1080, h: 1620, alt: "Portrait in a dark kitchen, red and teal light, chains over a white tee" },
        { src: "media/sets/01/02.jpg", w: 1620, h: 1080, alt: "Profile portrait in violet and blue light, breathing out smoke" },
        { src: "media/sets/01/03.jpg", w: 1620, h: 1080, alt: "Two-person portrait in deep red light, one on the phone, one with a lighter" }
      ]
    }
  ],

  films: [
    { id: "WHznrMrNoJs", title: "BEENIE - In My Bag" }
  ],

  // drag-to-swipe pairs: the room it was shot in -> the finished photo
  reveals: [
    {
      before: { src: "media/bts/setup_01.jpg", pos: "50% 14%", alt: "On set: the subject between a red light and a panel light in a plain room" },
      after:  { src: "media/sets/01/01.jpg", pos: "47% 50%", alt: "The finished portrait in red and green gel light" }
    }
  ],

  bts: [
    { type: "video", src: "media/bts/clip.mp4", poster: "media/bts/clip.jpg", w: 720, h: 1280, alt: "Behind the scenes clip from the shoot" },
    { src: "media/bts/01.jpg", w: 1512, h: 2016, alt: "Camera with an external monitor showing the viewfinder display" },
    { src: "media/bts/02.jpg", w: 1290, h: 2086, alt: "Softbox and camera on a stand in a hazy room" }
  ],

  links: [
    { label: "YouTube", href: "https://www.youtube.com/@DMVDigi" }
  ]
};
