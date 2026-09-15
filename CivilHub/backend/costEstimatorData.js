// backend/costEstimatorData.js

// ============================================================
// CivilHub Cost Estimator - Temporary Data
// ============================================================
// IMPORTANT:
// These are temporary/demo values.
// Later these values can come from MySQL/database
// without changing the frontend API structure.
// ============================================================

const COST_RATES = {
  standard: {
    quality: "standard",
    ratePerSqft: 3500,
  },

  premium: {
    quality: "premium",
    ratePerSqft: 4500,
  },

  luxury: {
    quality: "luxury",
    ratePerSqft: 6000,
  },
};

// ============================================================
// Building Regulations
// ============================================================

const REGULATIONS = {
  RAJUK: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  CDA: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  KDA: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  RDA: {
    residential: {
      coverage: 60,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },

  General: {
    residential: {
      coverage: 60,
      far: 3,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    commercial: {
      coverage: 70,
      far: 4,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },

    mixed: {
      coverage: 65,
      far: 3.5,
      frontSetback: 5,
      rearSetback: 3,
      sideSetback: 3,
    },
  },
};

module.exports = {
  COST_RATES,
  REGULATIONS,
};