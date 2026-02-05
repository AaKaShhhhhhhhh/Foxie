/**
 * Gesture Recognition Utilities
 * Uses MediaPipe hand landmarks to detect gestures
 * 
 * Landmarks reference:
 * 0: wrist
 * 4: thumb tip
 * 8: index finger tip
 * 12: middle finger tip
 * 16: ring finger tip
 * 20: pinky finger tip
 */

export const GestureTypes = {
  WAVE: 'wave',
  THUMBS_UP: 'thumbsUp',
  PROXIMITY: 'proximity',
  PEACE: 'peace',
  OPEN_HAND: 'openHand',
  POINTING: 'pointing',
  OK_SIGN: 'okSign',
  GRAB: 'grab',
};

/**
 * Calculate distance between two points
 */
export const getDistance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate angle between three points (in degrees)
 */
export const getAngle = (p1, p2, p3) => {
  const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  const angle = Math.abs(angle1 - angle2);
  return (angle * 180) / Math.PI;
};

/**
 * Check if hand is open (all fingers extended)
 */
export const isOpenHand = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const palmBase = landmarks[0];
  const fingers = [
    landmarks[8],   // index
    landmarks[12],  // middle
    landmarks[16],  // ring
    landmarks[20],  // pinky
  ];

  // All fingers should be above palm (lower y value)
  const openFingers = fingers.filter(f => f.y < palmBase.y - 0.1).length;
  return openFingers >= 3;
};

/**
 * Check if hand is making a fist (fingers curled)
 */
export const isFist = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const palmBase = landmarks[0];
  const fingers = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

  // Most fingers below palm
  const closedFingers = fingers.filter(f => f.y > palmBase.y).length;
  return closedFingers >= 3;
};

/**
 * Check if thumbs up gesture
 */
export const isThumbsUp = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const indexTip = landmarks[8];
  const indexBase = landmarks[5];

  // Thumb should be extended upward and to the right
  const thumbUp = thumbTip.y < thumbIP.y - 0.1;
  // Fingers should be curled (below index base)
  const fingersClosed = indexTip.y > indexBase.y;
  // Thumb should be to the left of index finger
  const thumbLeft = thumbTip.x < indexTip.x;

  return thumbUp && fingersClosed && thumbLeft;
};

/**
 * Check if waving gesture (hand moving side to side)
 */
export const isWaving = (landmarks, previousLandmarks) => {
  if (!landmarks || !previousLandmarks || landmarks.length < 21) return false;

  const handCenter = landmarks[9];
  const prevHandCenter = previousLandmarks[9];

  // Hand moving horizontally
  const horizontalDiff = Math.abs(handCenter.x - prevHandCenter.x);
  const verticalDiff = Math.abs(handCenter.y - prevHandCenter.y);

  // Horizontal movement more than vertical
  return horizontalDiff > verticalDiff * 1.5 && horizontalDiff > 0.02;
};

/**
 * Check if hand is close to camera (proximity detection)
 */
export const isProximity = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const palmBase = landmarks[0];
  const middleFinger = landmarks[12];

  // Hand scale (size relative to frame)
  const handScale = getDistance(palmBase, middleFinger);

  // Hand is large when close to camera
  return handScale > 0.25;
};

/**
 * Check if peace sign (index and middle finger extended)
 */
export const isPeaceSign = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const palmBase = landmarks[0];

  // Index and middle extended upward
  const indexUp = indexTip.y < palmBase.y - 0.15;
  const middleUp = middleTip.y < palmBase.y - 0.15;
  // Ring and pinky curled
  const ringCurled = ringTip.y > palmBase.y - 0.05;
  const pinkyCurled = pinkyTip.y > palmBase.y - 0.05;

  return indexUp && middleUp && ringCurled && pinkyCurled;
};

/**
 * Check if pointing gesture (only index extended)
 */
export const isPointing = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const palmBase = landmarks[0];

  // Index extended
  const indexExtended = indexTip.y < palmBase.y - 0.1;
  // Others curled
  const othersCurled =
    middleTip.y > palmBase.y - 0.05 &&
    ringTip.y > palmBase.y - 0.05 &&
    pinkyTip.y > palmBase.y - 0.05;

  return indexExtended && othersCurled;
};

/**
 * Check if OK sign (thumb and index meeting, others extended)
 */
export const isOKSign = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  // Thumb and index close together
  const thumbIndexClose = getDistance(thumbTip, indexTip) < 0.05;
  // Other fingers extended
  const othersExtended =
    middleTip.y < 0.5 && ringTip.y < 0.5 && pinkyTip.y < 0.5;

  return thumbIndexClose && othersExtended;
};

/**
 * Main gesture detection function
 * Returns the detected gesture or null
 */
export const detectGesture = (landmarks, previousLandmarks) => {
  if (!landmarks) return null;

  // Check gestures in order of specificity
  if (isThumbsUp(landmarks)) return GestureTypes.THUMBS_UP;
  if (isPeaceSign(landmarks)) return GestureTypes.PEACE;
  if (isPointing(landmarks)) return GestureTypes.POINTING;
  if (isOKSign(landmarks)) return GestureTypes.OK_SIGN;
  if (isOpenHand(landmarks)) return GestureTypes.OPEN_HAND;
  if (isFist(landmarks)) return GestureTypes.GRAB;
  if (isProximity(landmarks)) return GestureTypes.PROXIMITY;
  if (isWaving(landmarks, previousLandmarks)) return GestureTypes.WAVE;

  return null;
};

/**
 * Get hand position normalized to screen coordinates (0-100%)
 */
export const getHandPosition = (landmarks, isMirrored = true) => {
  if (!landmarks || landmarks.length < 21) return null;

  const handCenter = landmarks[9]; // Hand center (middle finger base)

  return {
    x: isMirrored ? (1 - handCenter.x) * 100 : handCenter.x * 100,
    y: handCenter.y * 100,
    raw: handCenter,
  };
};

/**
 * Get hand velocity (movement speed) between frames
 */
export const getHandVelocity = (current, previous) => {
  if (!current || !previous) return 0;
  return getDistance(current, previous);
};

/**
 * Get hand orientation angle (0-360 degrees)
 */
export const getHandOrientation = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return 0;

  const palmBase = landmarks[0];
  const middleFinger = landmarks[12];

  const angle = Math.atan2(
    middleFinger.y - palmBase.y,
    middleFinger.x - palmBase.x
  );

  return (angle * 180) / Math.PI + 180;
};

/**
 * Check if hand is visible (basic confidence check)
 */
export const isHandVisible = (landmarks) => {
  if (!landmarks || landmarks.length === 0) return false;
  // Check if any landmark has reasonable confidence
  return true;
};

export default {
  GestureTypes,
  detectGesture,
  getHandPosition,
  getHandVelocity,
  getHandOrientation,
  isHandVisible,
  getDistance,
  getAngle,
  isOpenHand,
  isFist,
  isThumbsUp,
  isWaving,
  isProximity,
  isPeaceSign,
  isPointing,
  isOKSign,
};
