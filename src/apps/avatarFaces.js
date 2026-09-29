/**
 * 32x32 pixel-art headshots for the MySpace friend grid.
 *
 * Every friend in about.json is a parody of a real figure in tech, so the
 * faces are authored one at a time rather than generated: at this size
 * recognition comes almost entirely from silhouette, eyewear, facial hair and
 * clothing, and no hash can invent those. `FACES` maps the `variant` field in
 * about.json to a map plus its own palette. Names are free to change without
 * disturbing the art, because `variant` is what selects it.
 *
 * Anything with no variant — the profile photo placeholder, any friend added
 * later — still falls back to the old behaviour: one of three generic maps and
 * one of six palettes, both picked by hashing the name, so the same name
 * always yields the same face.
 *
 * These are caricatures drawn from public likenesses, not photographs.
 */

// Pixel roles, one character per cell:
//
//   .  background      H  hair            h  hair highlight
//   S  skin            s  skin shadow     E  eye
//   W  white (teeth)   M  mouth           B  facial hair
//   G  glasses frame   L  lens            C  shirt
//   c  shirt accent    j  shirt highlight T  tie / accent
//
// Anything not listed here is rejected by avatarFaces.test.js.
export const ROLES = {
  H: "hair",
  h: "hairLight",
  S: "skin",
  s: "skinShadow",
  E: "eye",
  W: "white",
  M: "mouth",
  B: "beard",
  G: "glasses",
  L: "lens",
  C: "shirt",
  c: "shirt2",
  j: "shirtLight",
  T: "tie",
};

// Maps are square, and a face's grid is however many rows it has — the friend
// faces are 32x32, the profile face can be swapped to 64x64 (see ME below).
// Nothing hardcodes a size; `faceFor` reports the grid and the viewBox follows
// it, which is why there is no module-level GRID constant to fall out of sync.

// Colours every face shares unless its own palette overrides them.
export const BASE_COLORS = {
  eye: "#20140c",
  white: "#ffffff",
  mouth: "#b9714a",
  glasses: "#3a3a3a",
  lens: "#dfe7ef",
};

/* -------------------------------------------------------------------------
   Authored faces
   ------------------------------------------------------------------------- */

// MySpace Tom: whiteboard-white background, plain white tee, no tie.
const TOM = [
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSHHHHSSHHHHSSHH.......",
  ".......HHSSSEESSSSEESSSHH.......",
  ".......HHSSSEESSSSEESSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSssSSSSSSHH.......",
  ".......HHSSSSSssssSSSSSHH.......",
  "........HSSSSSSSSSSSSSSH........",
  "........HSSSMSSSSSSMSSSH........",
  ".........SSSMMMMMMMMSSS.........",
  "..........SSSSSSSSSSSS..........",
  "...........SSSSSSSSSS...........",
  ".............SSSSSS.............",
  ".............SSSSSS.............",
  "...........CCccccccCC...........",
  ".........CCCCccccccCCCC.........",
  ".......CCCCCCCCCCCCCCCCCC.......",
  "......CCCCCCCCCCCCCCCCCCCC......",
  ".....CCCCCCCCCCCCCCCCCCCCCC.....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
];

// Gill Bates: oversized square frames, side-parted fringe, V-neck sweater
// over a white shirt.
const GATES = [
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHHHHHHHHHHHSSSSHH.......",
  ".......HHHHHHHHSSSSSSSSHH.......",
  ".......HHHHHSSSSSSSSSSSHH.......",
  ".......HHHSSSSSSSSSSSSSHH.......",
  ".......HHGGGGGGGGGGGGGGHH.......",
  ".......HHGLLEELGGLEELLGHH.......",
  ".......HHGLLEELGGLEELLGHH.......",
  ".......HHGLLLLLGGLLLLLGHH.......",
  ".......HHGGGGGGGGGGGGGGHH.......",
  ".......HHSSSSSssssSSSSSHH.......",
  "........HSSSSSSSSSSSSSSH........",
  "........HSSSSMMMMMMSSSSH........",
  ".........SSSSSSSSSSSSSS.........",
  "..........SSSSSSSSSSSS..........",
  "...........SSSSSSSSSS...........",
  ".............SSSSSS.............",
  ".............SSSSSS.............",
  "...........CCccccccCC...........",
  ".........CCCCccccccCCCC.........",
  ".......CCCCCCCccccCCCCCCC.......",
  "......CCCCCCCCCccCCCCCCCCC......",
  ".....CCCCCCCCCCCCCCCCCCCCCC.....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
];

// Zark Muckerberg: wide curly mop with a low hairline, grey crew-neck tee.
const ZUCKERBERG = [
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  "......HHhhHHHHHHHHHHHHhhHH......",
  "......HHHHhhHHHHHHHHhhHHHH......",
  "......HHHHHHHHHHHHHHHHHHHH......",
  "......HHHHHHHHHHHHHHHHHHHH......",
  "......HHHSSSSSSSSSSSSSSHHH......",
  "......HHHSSSSSSSSSSSSSSHHH......",
  "......HHHSSHHHHSSHHHHSSHHH......",
  "......HHHSSSEESSSSEESSSHHH......",
  "......HHHSSSEESSSSEESSSHHH......",
  "......HHHSSSSSSSSSSSSSSHHH......",
  "......HHHSSSSSSssSSSSSSHHH......",
  "......HHHSSSSSssssSSSSSHHH......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSMMMMMMSSSSHH.......",
  "........HSSSSSSSSSSSSSSH........",
  ".........SSSSSSSSSSSSSS.........",
  "..........SSSSSSSSSSSS..........",
  "............SSSSSSSS............",
  ".............SSSSSS.............",
  "...........CCccccccCC...........",
  ".........CCCCccccccCCCC.........",
  ".......CCCCCCCCCCCCCCCCCC.......",
  "......CCCCCCCCCCCCCCCCCCCC......",
  ".....CCCCCCCCCCCCCCCCCCCCCC.....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
];

// Linos Torvalds: thin wire ovals, hair receding at the temples, short beard.
const TORVALDS = [
  "................................",
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHHSSSSSSSSSSSSHHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSGGGGGSSGGGGGSHH.......",
  ".......HHSGLEEGGGGEELGSHH.......",
  ".......HHSGLEEGSSGEELGSHH.......",
  ".......HHSGGGGGSSGGGGGSHH.......",
  ".......HHSSSSSSssSSSSSSHH.......",
  ".......HHSSSSSssssSSSSSHH.......",
  "........HSSSSBBBBBBSSSSH........",
  "........HSSSBBMMMMBBSSSH........",
  ".........SSBBBBBBBBBBSS.........",
  "..........SBBBBBBBBBBS..........",
  "...........BBBBBBBBBB...........",
  ".............SSSSSS.............",
  ".............SSSSSS.............",
  "...........CCccccccCC...........",
  ".........CCCCccccccCCCC.........",
  ".......CCCCCCCCCCCCCCCCCC.......",
  "......CCCCCCCCCCCCCCCCCCCC......",
  ".....CCCCCCCCCCCCCCCCCCCCCC.....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
];

// Steve Jerbs: rimless round glasses, grey stubble, black turtleneck pulled up
// under the chin — the whole silhouette is the likeness here.
const JOBS = [
  "................................",
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHHSSSSSSSSSSSSHHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSGGGSSSSGGGSSHH.......",
  ".......HHSGLLLGSSGLLLGSHH.......",
  ".......HHSGLEEGGGGEELGSHH.......",
  ".......HHSGLLLGSSGLLLGSHH.......",
  ".......HHSSGGGSSSSGGGSSHH.......",
  ".......HHSSSSSssssSSSSSHH.......",
  "........HBBBBBBBBBBBBBBH........",
  "........HBBBBMMMMMMBBBBH........",
  ".........BBBBBBBBBBBBBB.........",
  "..........BBBBBBBBBBBB..........",
  "...........BBBBBBBBBB...........",
  "............CCCCCCCC............",
  "...........CCCCCCCCCC...........",
  "..........cccccccccccc..........",
  ".........CCCCCCCCCCCCCC.........",
  ".......CCCCCCCCCCCCCCCCCC.......",
  "......CCCCCCCCCCCCCCCCCCCC......",
  ".....CCCCCCCCCCCCCCCCCCCCCC.....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
];

// Elon Tusk: dark swept hair with a widow's peak, dark jacket over an open
// white collar — no tie, which is what separates him from Bozos below.
const MUSK = [
  "................................",
  "................................",
  "................................",
  "...........HHHHHHHHHH...........",
  ".........HHHHHHHHHHHHHH.........",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHHHSSHHHHHHSSHHHH.......",
  ".......HHHSSSSHHHHSSSSHHH.......",
  ".......HHSSSSSSHHSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSHHHHSSHHHHSSHH.......",
  ".......HHSSSEESSSSEESSSHH.......",
  ".......HHSSSEESSSSEESSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSssSSSSSSHH.......",
  ".......HHSSSSSssssSSSSSHH.......",
  "........HSSSSSSSSSSSSSSH........",
  "........HSSSSMMMMMMSSSSH........",
  ".........SSSSSSSSSSSSSS.........",
  "..........SSSSSSSSSSSS..........",
  "...........SSSSSSSSSS...........",
  ".............SSSSSS.............",
  ".............SSSSSS.............",
  "...........CCccccccCC...........",
  ".........CCCCccccccCCCC.........",
  ".......CCCCCCCccccCCCCCCC.......",
  "......CCCCCCCCCccCCCCCCCCC......",
  ".....CCCCCCCCCCCCCCCCCCCCCC.....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
];

// Jeff Bozos: bald to the crown and the wide open grin, navy suit and tie.
const BEZOS = [
  "................................",
  "................................",
  "................................",
  "................................",
  "..........SSSSSSSSSSSS..........",
  "........SSSSSSSSSSSSSSSS........",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSHHHHSSHHHHSSSS.......",
  ".......SSSSSEESSSSEESSSSS.......",
  ".......SSSSSEESSSSEESSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSssSSSSSSSS.......",
  ".......SSSSSSSssssSSSSSSS.......",
  "........SSSSSSSSSSSSSSSS........",
  "........SSSMMMMMMMMMMSSS........",
  ".........SSWWWWWWWWWWSS.........",
  "..........SSMMMMMMMMSS..........",
  "...........SSSSSSSSSS...........",
  ".............SSSSSS.............",
  ".............SSSSSS.............",
  "...........CCccTTccCC...........",
  ".........CCCCccTTccCCCC.........",
  ".......CCCCCCcTTTTcCCCCCC.......",
  "......CCCCCCCCTTTTCCCCCCCC......",
  ".....CCCCCCCCCTTTTCCCCCCCCC.....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
];

// Ada Loveless: centre-parted Victorian hair falling in ringlets past the jaw,
// wide white lace collar over a blue gown, gold brooch at the centre.
const LOVELACE = [
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  "......HHHHHHHHHHHHHHHHHHHH......",
  "......HHHHHHHHHHHHHHHHHHHH......",
  "......HHHHSSSSSHHSSSSSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSHHHHSSHHHHSHHHH......",
  "......HHHHSSEESSSSEESSHHHH......",
  "......HHHHSSEESSSSEESSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  ".....HHHHHSSSSSssSSSSSHHHHH.....",
  ".....HHHHHSSSSssssSSSSHHHHH.....",
  ".....HHHHHSSSSSSSSSSSSHHHHH.....",
  ".....HHHHHSSSSMMMMSSSSHHHHH.....",
  ".....HHHHHSSSSSSSSSSSSHHHHH.....",
  ".......HHHHSSSSSSSSSSHHHH.......",
  "........HHHHSSSSSSSSHHHH........",
  ".........HHHHSSSSSSHHHH.........",
  "..........HHHSSSSSSHHH..........",
  ".........cccccccccccccc.........",
  ".......cccccccccccccccccc.......",
  "......cccccccccccccccccccc......",
  "......CCCCccccccccccccCCCC......",
  ".....CCCCCCCccccccccCCCCCCC.....",
  "....CCCCCCCCCccccccCCCCCCCCC....",
  "....CCCCCCCCCCCTTCCCCCCCCCCC....",
  "....CCCCCCCCCCCCCCCCCCCCCCCC....",
];

// The profile face, at two resolutions. Close-shaven hair sits as a thin cap
// tight to the skull with a faded `h` edge down the sides into the beard —
// there is no volume to draw, so the silhouette is the skull itself.
export const ME_32 = [
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHhhhhhhhhhhhhHH........",
  ".......HHhhhhhhhhhhhhhhHH.......",
  "......HHhhhhhhhhhhhhhhhhHH......",
  "......HHhSSSSSSSSSSSSSShHH......",
  "......HHhSSSSSSSSSSSSSShHH......",
  "......HHhSHHHHSSSSHHHHShHH......",
  "......HHhSSSSSSSSSSSSSShHH......",
  "......HHhSSEESSSSSSEESShHH......",
  "......HHhSSEESSSSSSEESShHH......",
  "......HHhSSSSSSSSSSSSSShHH......",
  "......HHhSSSSSSssSSSSSShHH......",
  "......HHhSSSSSssssSSSSShHH......",
  "......HBBSSSSBBBBBBSSSSBBH......",
  "......HBBSSSBMMMMMMBSSSBBH......",
  "......HBBSSBBBBBBBBBBSSBBH......",
  ".......BBBBBBBBBBBBBBBBBB.......",
  "........BBBBBBBBBBBBBBBB........",
  "..........BBBBBBBBBBBB..........",
  "............SSSSSSSS............",
  "............STTTTTTS............",
  ".........CCCccccccccCCC.........",
  ".......CCCCCccccccccCCCCC.......",
  "......CCCCCCccccccccCCCCCC......",
  ".....CCCCCCCccccccccCCCCCCC.....",
  "....CCCCCCCCccccccccCCCCCCCC....",
  "....CCCCCCCCccccccccCCCCCCCC....",
];

export const ME_64 = [
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "....................HHHHHHHHHHHHHHHHHHHHHHHH....................",
  "..................HHHHHHHHHHHHHHHHHHHHHHHHHHHH..................",
  "................HHHhhhhhhhhhhhhhhhhhhhhhhhhhhHHH................",
  "..............HHHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhHHH..............",
  ".............HHHHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhHHHH.............",
  "............HHHHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhHHHH............",
  "............HHHHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhHHHH............",
  "............HHHHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhHHHH............",
  "............HHHHhhSSSSSSSSSSSSSSSSSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSSSSSSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSSSSSSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSSSSSSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSHHHHHHHHHSSSSHHHHHHHHHSSShhHHHH............",
  "............HHHHhhSSSHHHHHHHHHhhhhHHHHHHHHHSSShhHHHH............",
  "............HHHHhhSSSSHHHHHHHHSSSSHHHHHHHHSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSSSSSSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSSSSSSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSHHHHSSSSSSSSSSHHHHSSSSShhHHHH............",
  "............HHHHhhSSSSSWEEWSSSSSSSSSSWEEWSSSSShhHHHH............",
  "............HHHHhhSSSSSWEEWSSSSSSSSSSWEEWSSSSShhHHHH............",
  "............HHHHhhSSSSssssssSSSSSSSSssssssSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSSSSSSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSssssSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSssssSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSSssssSSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSSssssssSSSSSSSSSSShhHHHH............",
  "............HHHHhhSSSSSSSSSSssssssssSSSSSSSSSShhHHHH............",
  "............HHBBBBSSSSSSSSBBBBBBBBBBBBSSSSSSSSBBBBHH............",
  "............HHBBBBSSSSSSSSBBBBBBBBBBBBSSSSSSSSBBBBHH............",
  "............HHBBBBSSSSSSBBMMMMMMMMMMMMBBSSSSSSBBBBHH............",
  "............HHBBBBSSSSSBBBBMMMMMMMMMMBBBBSSSSSBBBBHH............",
  "............HHBBBBSSSSBBBBBBBBBBBBBBBBBBBBSSSSBBBBHH............",
  "............HHBBBBSSBBBBBBBBBBBBBBBBBBBBBBBBSSBBBBHH............",
  "............HHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBHH............",
  ".............BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.............",
  "..............BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB..............",
  "................BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB................",
  "..................BBBBBBBBBBBBBBBBBBBBBBBBBBBB..................",
  ".....................BBBBBBBBBBBBBBBBBBBBBB.....................",
  "........................SSSSSSSSSSSSSSSS........................",
  "........................SSSSSSSSSSSSSSSS........................",
  "........................STsTsTsTsTsTsTsS........................",
  "........................SSSSSTTTTTTSSSSS........................",
  "..................jCCCCjccccccccccccccccjCCCCj..................",
  "...............jCCCCCCCjccccccccccccccccjCCCCCCCj...............",
  ".............CCCCCCCCCCjccccccccccccccccjCCCCCCCCCC.............",
  "...........CCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCC...........",
  "..........CCCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCCC..........",
  ".........CCCCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCCCC.........",
  "........CCCCCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCCCCC........",
  "........CCCCCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCCCCC........",
  "........CCCCCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCCCCC........",
  "........CCCCCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCCCCC........",
  "........CCCCCCCCCCCCCCCjccccccccccccccccjCCCCCCCCCCCCCCC........",
];

// ---- Which profile face renders -------------------------------------------
// Comment one of these two lines out to switch resolutions. ME_32 matches the
// friend grid; ME_64 has room for eye whites, a graded hairline, chain links
// and the lit edge of the fleece. Nothing else needs changing — the viewBox
// is taken from the map's own height.
const ME = ME_32;
// const ME = ME_64

export const FACES = {
  // The profile picture. Unlike the friends this is drawn from a photograph,
  // so the palette is sampled from it rather than invented.
  me: {
    map: ME,
    palette: {
      bg: "#cdd3c9",
      skin: "#d9a77a",
      skinShadow: "#b8855a",
      hair: "#241a14",
      hairLight: "#4a3a2e",
      beard: "#2b1f17",
      eye: "#3a2414",
      white: "#d9c7b2",
      mouth: "#a05f48",
      shirt: "#a8aeb0",
      shirtLight: "#c6cbcc",
      shirt2: "#8a7f70",
      tie: "#d4af37",
    },
  },
  tom: {
    map: TOM,
    palette: {
      bg: "#f2f2ee",
      skin: "#e8b98a",
      skinShadow: "#cf9b6c",
      hair: "#2b2b2b",
      hairLight: "#454545",
      shirt: "#ffffff",
      shirt2: "#d8d8d8",
    },
  },
  gates: {
    map: GATES,
    palette: {
      bg: "#a9b8a0",
      skin: "#eec49a",
      skinShadow: "#d4a273",
      hair: "#8a6a3a",
      hairLight: "#a98650",
      // Light frame and near-white lens: a dark frame at this size closes up
      // into a solid bar and the eyes disappear behind it.
      glasses: "#6b5a42",
      lens: "#eef3f7",
      shirt: "#7b6f93",
      shirt2: "#f4f2ee",
    },
  },
  zuckerberg: {
    map: ZUCKERBERG,
    palette: {
      bg: "#9fb0c4",
      skin: "#f0d0b0",
      skinShadow: "#d9ae8a",
      hair: "#7a5a38",
      hairLight: "#ab8450",
      shirt: "#8e9298",
      shirt2: "#74787e",
    },
  },
  torvalds: {
    map: TORVALDS,
    palette: {
      bg: "#b9c6a8",
      skin: "#f0c8a2",
      skinShadow: "#d6a878",
      hair: "#b5773c",
      hairLight: "#cf9354",
      beard: "#a96c36",
      glasses: "#6f6f6f",
      lens: "#e6eef4",
      shirt: "#3f7f7a",
      shirt2: "#316663",
      mouth: "#a85f46",
    },
  },
  jobs: {
    map: JOBS,
    palette: {
      bg: "#6e7883",
      skin: "#e8bc93",
      skinShadow: "#cc9a6e",
      hair: "#c2c2c2",
      hairLight: "#dcdcdc",
      beard: "#9a9a9a",
      glasses: "#4c4a52",
      lens: "#dde6ee",
      shirt: "#16161a",
      shirt2: "#2d2d33",
      mouth: "#8f5a3c",
    },
  },
  musk: {
    map: MUSK,
    palette: {
      bg: "#8f9bb0",
      skin: "#e7bb95",
      skinShadow: "#c99a72",
      hair: "#3a2a1c",
      hairLight: "#55402a",
      shirt: "#23262e",
      shirt2: "#e8e8e8",
    },
  },
  bezos: {
    map: BEZOS,
    palette: {
      bg: "#b3a898",
      skin: "#d9a978",
      skinShadow: "#b98a5e",
      hair: "#3a3a3a",
      shirt: "#23304a",
      shirt2: "#f2f2f2",
      tie: "#7a1f2a",
      mouth: "#9c5a44",
    },
  },
  lovelace: {
    map: LOVELACE,
    palette: {
      bg: "#cdc3d6",
      skin: "#f4dcc4",
      skinShadow: "#dcb996",
      hair: "#2a1d16",
      hairLight: "#47301f",
      shirt: "#3f5f8f",
      shirt2: "#f6f3ec",
      tie: "#c9a227",
      eye: "#3a2418",
      mouth: "#b06a5e",
    },
  },
};

/* -------------------------------------------------------------------------
   Generic fallback, for names with no authored face
   ------------------------------------------------------------------------- */

const SHORT = [
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHHHHHHHHHHHHHHHHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSHHHHSSHHHHSSHH.......",
  ".......HHSSSEESSSSEESSSHH.......",
  ".......HHSSSEESSSSEESSSHH.......",
  ".......HHSSSSSSSSSSSSSSHH.......",
  ".......HHSSSSSSssSSSSSSHH.......",
  ".......HHSSSSSssssSSSSSHH.......",
  "........HSSSSSSSSSSSSSSH........",
  "........HSSSSMMMMMMSSSSH........",
  ".........SSSSSSSSSSSSSS.........",
  "..........SSSSSSSSSSSS..........",
  "...........SSSSSSSSSS...........",
  ".............SSSSSS.............",
  ".............SSSSSS.............",
  "...........CCccTTccCC...........",
  ".........CCCCccTTccCCCC.........",
  ".......CCCCCCcTTTTcCCCCCC.......",
  "......CCCCCCCCTTTTCCCCCCCC......",
  ".....CCCCCCCCCTTTTCCCCCCCCC.....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
];

const BALD = [
  "................................",
  "................................",
  "................................",
  "................................",
  "..........SSSSSSSSSSSS..........",
  "........SSSSSSSSSSSSSSSS........",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSHHHHSSHHHHSSSS.......",
  ".......SSSSSEESSSSEESSSSS.......",
  ".......SSSSSEESSSSEESSSSS.......",
  ".......SSSSSSSSSSSSSSSSSS.......",
  ".......SSSSSSSSssSSSSSSSS.......",
  ".......SSSSSSSssssSSSSSSS.......",
  "........SSSSSSSSSSSSSSSS........",
  "........SSSSSMMMMMMSSSSS........",
  ".........SSSSSSSSSSSSSS.........",
  "..........SSSSSSSSSSSS..........",
  "...........SSSSSSSSSS...........",
  ".............SSSSSS.............",
  ".............SSSSSS.............",
  "...........CCccTTccCC...........",
  ".........CCCCccTTccCCCC.........",
  ".......CCCCCCcTTTTcCCCCCC.......",
  "......CCCCCCCCTTTTCCCCCCCC......",
  ".....CCCCCCCCCTTTTCCCCCCCCC.....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
];

const LONG = [
  "................................",
  "................................",
  "................................",
  "..........HHHHHHHHHHHH..........",
  "........HHHHHHHHHHHHHHHH........",
  "......HHHHHHHHHHHHHHHHHHHH......",
  "......HHHHHHHHHHHHHHHHHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSHHHHSSHHHHSHHHH......",
  "......HHHHSSEESSSSEESSHHHH......",
  "......HHHHSSEESSSSEESSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSSSSSssSSSSSHHHH......",
  "......HHHHSSSSssssSSSSHHHH......",
  "......HHHHSSSSSSSSSSSSHHHH......",
  "......HHHHSSSSMMMMSSSSHHHH......",
  ".......HHHSSSSSSSSSSSSHHH.......",
  "........HHHSSSSSSSSSSHHH........",
  ".........HHHSSSSSSSSHHH.........",
  "...........HHSSSSSSHH...........",
  "............HSSSSSSH............",
  "...........CCccTTccCC...........",
  ".........CCCCccTTccCCCC.........",
  ".......CCCCCCcTTTTcCCCCCC.......",
  "......CCCCCCCCTTTTCCCCCCCC......",
  ".....CCCCCCCCCTTTTCCCCCCCCC.....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
  "....CCCCCCCCCCTTTTCCCCCCCCCC....",
];

export const FALLBACK_MAPS = [SHORT, BALD, LONG];

export const FALLBACK_PALETTES = [
  {
    bg: "#b9c6d6",
    skin: "#e8b98a",
    skinShadow: "#cf9b6c",
    hair: "#3b2a1a",
    hairLight: "#55402a",
    shirt: "#2f4f7f",
    shirt2: "#f0f0f0",
    tie: "#8c1f1f",
  },
  {
    bg: "#c8c4b4",
    skin: "#d9a071",
    skinShadow: "#bd855a",
    hair: "#6b4423",
    hairLight: "#86592f",
    shirt: "#4a4a52",
    shirt2: "#f0f0f0",
    tie: "#1f3f6b",
  },
  {
    bg: "#aec4b0",
    skin: "#f0c9a0",
    skinShadow: "#d3a97f",
    hair: "#a8703a",
    hairLight: "#c28b4e",
    shirt: "#5a6b7a",
    shirt2: "#f0f0f0",
    tie: "#2f6b3f",
  },
  {
    bg: "#cbb8c4",
    skin: "#c68642",
    skinShadow: "#a86d32",
    hair: "#241a12",
    hairLight: "#3c2b1c",
    shirt: "#3f3f6b",
    shirt2: "#f0f0f0",
    tie: "#7a5a1f",
  },
  {
    bg: "#b4bcc8",
    skin: "#8d5524",
    skinShadow: "#6f4119",
    hair: "#1a1208",
    hairLight: "#2e2214",
    shirt: "#6b3f3f",
    shirt2: "#f0f0f0",
    tie: "#c0a020",
  },
  {
    bg: "#d0c7ae",
    skin: "#ffdbac",
    skinShadow: "#e0b98a",
    hair: "#c9b037",
    hairLight: "#ddc65a",
    shirt: "#3f5a4a",
    shirt2: "#f0f0f0",
    tie: "#6b1f4a",
  },
];

// djb2 — small, stable, and enough to spread names across the palettes.
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1)
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Resolve a name (and optional variant) to the map and full colour table the
 * renderer needs. An unknown variant falls through to the hashed generic face
 * rather than throwing, so a typo in about.json costs a likeness, not the page.
 */
export function faceFor(name, variant) {
  const authored = variant ? FACES[variant] : undefined;
  if (authored) {
    return {
      map: authored.map,
      grid: authored.map.length,
      colors: { ...BASE_COLORS, ...authored.palette },
    };
  }

  // `>>>`, not `>>` — a signed shift turns any hash past 2^31 negative, which
  // indexes off the front of the array.
  const h = hash(name);
  const map = FALLBACK_MAPS[h % FALLBACK_MAPS.length];
  const palette = FALLBACK_PALETTES[(h >>> 3) % FALLBACK_PALETTES.length];
  return { map, grid: map.length, colors: { ...BASE_COLORS, ...palette } };
}
