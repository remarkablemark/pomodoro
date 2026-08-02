import { playBeep } from './beep';

interface MockOscillator {
  connect: ReturnType<typeof vi.fn>;
  frequency: { value: number };
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  type: string;
}

interface MockGainNode {
  connect: ReturnType<typeof vi.fn>;
  gain: { value: number };
}

const createOscillator = vi.fn((): MockOscillator => ({
  connect: vi.fn(),
  frequency: { value: 0 },
  start: vi.fn(),
  stop: vi.fn(),
  type: '',
}));

const createGain = vi.fn((): MockGainNode => ({
  connect: vi.fn(),
  gain: { value: 0 },
}));

const DESTINATION = {};

const MockAudioContext = vi.fn(function () {
  return {
    createOscillator,
    createGain,
    currentTime: 0,
    destination: DESTINATION,
  };
});

describe('playBeep', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext);
    MockAudioContext.mockClear();
    createOscillator.mockClear();
    createGain.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when AudioContext is not available', () => {
    vi.unstubAllGlobals();
    playBeep();
    expect(createOscillator).not.toHaveBeenCalled();
  });

  it('creates an oscillator and gain node and connects them', () => {
    playBeep();

    expect(MockAudioContext).toHaveBeenCalledTimes(1);
    expect(createOscillator).toHaveBeenCalledTimes(1);
    expect(createGain).toHaveBeenCalledTimes(1);

    const oscillator = createOscillator.mock.results[0]?.value as
      MockOscillator | undefined;
    const gainNode = createGain.mock.results[0]?.value as
      MockGainNode | undefined;

    expect(oscillator).toBeDefined();
    expect(gainNode).toBeDefined();

    if (!oscillator || !gainNode) {
      return;
    }

    expect(oscillator.type).toBe('sine');
    expect(oscillator.frequency.value).toBe(880);
    expect(gainNode.gain.value).toBe(0.1);

    expect(oscillator.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(DESTINATION);

    expect(oscillator.start).toHaveBeenCalled();
    expect(oscillator.stop).toHaveBeenCalledWith(0.2);
  });
});
