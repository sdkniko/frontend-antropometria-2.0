import { ISAKReferenceValues } from '../types';

export const isakReferenceValues: ISAKReferenceValues = {
    triceps: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 6.0,
        stdDev: 2.7,
        min: 2.0,
        max: 13.0,
        percentiles: {
            p5: 2.6,
            p15: 3.0,
            p25: 4.0,
            p50: 6.0,
            p75: 8.0,
            p85: 10.0,
            p95: 11.5
        }
    },
    subscapular: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 9.1,
        stdDev: 4.4,
        min: 3.0,
        max: 21.0,
        percentiles: {
            p5: 3.6,
            p15: 5.0,
            p25: 6.0,
            p50: 9.0,
            p75: 11.5,
            p85: 14.0,
            p95: 16.0
        }
    },
    biceps: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 3.3,
        stdDev: 2.0,
        min: 1.0,
        max: 11.0,
        percentiles: {
            p5: 1.2,
            p15: 1.6,
            p25: 2.0,
            p50: 3.0,
            p75: 4.5,
            p85: 5.5,
            p95: 6.5
        }
    },
    iliacCrest: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 9.4,
        stdDev: 4.9,
        min: 3.0,
        max: 24.0,
        percentiles: {
            p5: 3.6,
            p15: 5.0,
            p25: 6.5,
            p50: 9.0,
            p75: 11.5,
            p85: 13.5,
            p95: 16.0
        }
    },
    suprailiac: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 6.8,
        stdDev: 3.8,
        min: 2.0,
        max: 17.0,
        percentiles: {
            p5: 2.5,
            p15: 3.5,
            p25: 4.5,
            p50: 6.5,
            p75: 9.0,
            p85: 11.0,
            p95: 13.5
        }
    },
    abdominal: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 9.4,
        stdDev: 5.7,
        min: 2.0,
        max: 31.0,
        percentiles: {
            p5: 2.6,
            p15: 4.5,
            p25: 6.0,
            p50: 9.5,
            p75: 12.5,
            p85: 15.5,
            p95: 19.0
        }
    },
    thigh: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 11.3,
        stdDev: 5.3,
        min: 4.0,
        max: 26.0,
        percentiles: {
            p5: 4.5,
            p15: 6.0,
            p25: 8.0,
            p50: 11.0,
            p75: 14.0,
            p85: 17.0,
            p95: 20.0
        }
    },
    calf: {
        type: 'Pliegue',
        sex: 'Masculino',
        mean: 8.7,
        stdDev: 3.8,
        min: 3.0,
        max: 20.0,
        percentiles: {
            p5: 3.5,
            p15: 5.0,
            p25: 6.5,
            p50: 8.5,
            p75: 10.5,
            p85: 13.0,
            p95: 15.0
        }
    },
    relaxedArm: {
        type: 'Perímetro',
        sex: 'Masculino',
        mean: 28.2,
        stdDev: 2.1,
        min: 24.5,
        max: 32.0,
        percentiles: {
            p5: 25.5,
            p15: 26.5,
            p25: 27.0,
            p50: 28.0,
            p75: 29.5,
            p85: 30.5,
            p95: 31.0
        }
    },
    flexedArm: {
        type: 'Perímetro',
        sex: 'Masculino',
        mean: 30.9,
        stdDev: 2.2,
        min: 26.5,
        max: 35.0,
        percentiles: {
            p5: 27.5,
            p15: 28.5,
            p25: 29.5,
            p50: 31.0,
            p75: 32.5,
            p85: 34.0,
            p95: 35.0
        }
    },
    waist: {
        type: 'Perímetro',
        sex: 'Masculino',
        mean: 76.0,
        stdDev: 5.3,
        min: 65.0,
        max: 88.0,
        percentiles: {
            p5: 68.0,
            p15: 71.0,
            p25: 73.5,
            p50: 76.0,
            p75: 79.5,
            p85: 82.5,
            p95: 85.0
        }
    },
    hip: {
        type: 'Perímetro',
        sex: 'Masculino',
        mean: 90.6,
        stdDev: 4.7,
        min: 81.0,
        max: 101.0,
        percentiles: {
            p5: 83.0,
            p15: 86.5,
            p25: 88.0,
            p50: 91.0,
            p75: 94.0,
            p85: 97.0,
            p95: 99.5
        }
    },
    midThigh: {
        type: 'Perímetro',
        sex: 'Masculino',
        mean: 51.4,
        stdDev: 3.9,
        min: 45.0,
        max: 59.0,
        percentiles: {
            p5: 46.0,
            p15: 48.0,
            p25: 49.5,
            p50: 51.0,
            p75: 54.0,
            p85: 56.5,
            p95: 58.5
        }
    },
    calfCircumference: {
        type: 'Perímetro',
        sex: 'Masculino',
        mean: 36.5,
        stdDev: 2.2,
        min: 32.0,
        max: 41.0,
        percentiles: {
            p5: 33.0,
            p15: 34.5,
            p25: 35.0,
            p50: 36.5,
            p75: 38.0,
            p85: 39.5,
            p95: 40.5
        }
    },
    humerus: {
        type: 'Diámetro',
        sex: 'Masculino',
        mean: 6.6,
        stdDev: 0.3,
        min: 6.0,
        max: 7.3,
        percentiles: {
            p5: 6.1,
            p15: 6.3,
            p25: 6.4,
            p50: 6.6,
            p75: 6.8,
            p85: 7.0,
            p95: 7.2
        }
    },
    femur: {
        type: 'Diámetro',
        sex: 'Masculino',
        mean: 9.2,
        stdDev: 0.3,
        min: 8.6,
        max: 10.1,
        percentiles: {
            p5: 8.7,
            p15: 8.9,
            p25: 9.0,
            p50: 9.2,
            p75: 9.5,
            p85: 9.7,
            p95: 9.9
        }
    },
    biestyloid: {
        type: 'Diámetro',
        sex: 'Masculino',
        mean: 23.4,
        stdDev: 1.3,
        min: 20.0,
        max: 26.5,
        percentiles: {
            p5: 21.0,
            p15: 22.0,
            p25: 22.5,
            p50: 23.5,
            p75: 24.5,
            p85: 25.0,
            p95: 25.5
        }
    }
}; 