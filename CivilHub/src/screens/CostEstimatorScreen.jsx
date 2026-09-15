// src/screens/CostEstimatorScreen.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  calculateEstimate,
  calculateLandArea,
  calculateBuildableFootprint,
  calculateGrossFloorArea,
  calculateRoomArea,
  fetchRegulationRules,
  fetchCostRates,
  formatBDT,
  formatSqft,
  getRegulationRules,
  getCostRates,
  ROOM_DEFAULTS,
  QUALITY_OPTIONS,
  saveEstimate,
} from "../services/costEstimator";

/* =========================================================
   CONSTANTS
========================================================= */

const AUTHORITIES = [
  {
    value: "rajuk",
    label: "RAJUK",
  },
  {
    value: "cda",
    label: "CDA",
  },
  {
    value: "kda",
    label: "KDA",
  },
  {
    value: "rda",
    label: "RDA",
  },
  {
    value: "general",
    label: "General / Other",
  },
];

const BUILDING_TYPES = [
  {
    value: "residential",
    label: "Residential",
  },
  {
    value: "commercial",
    label: "Commercial",
  },
  {
    value: "mixed",
    label: "Mixed Use",
  },
];

const ROAD_SIDES = [
  {
    value: "front",
    label: "Front",
  },
  {
    value: "rear",
    label: "Rear",
  },
  {
    value: "left",
    label: "Left",
  },
  {
    value: "right",
    label: "Right",
  },
];

const ROOM_TYPES = [
  {
    key: "bedroom",
    label: "Bedroom",
    icon: "bed-outline",
  },
  {
    key: "bathroom",
    label: "Bathroom",
    icon: "water-outline",
  },
  {
    key: "living",
    label: "Living Room",
    icon: "people-outline",
  },
  {
    key: "dining",
    label: "Dining",
    icon: "restaurant-outline",
  },
  {
    key: "kitchen",
    label: "Kitchen",
    icon: "flame-outline",
  },
  {
    key: "balcony",
    label: "Balcony",
    icon: "sunny-outline",
  },
  {
    key: "other",
    label: "Other",
    icon: "grid-outline",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const createInitialRooms = () => {
  const rooms = {};

  ROOM_TYPES.forEach((room) => {
    rooms[room.key] = {
      count: room.key === "bedroom" ? 2 : room.key === "bathroom" ? 2 : 1,
      area: ROOM_DEFAULTS[room.key] || 50,
    };
  });

  return rooms;
};

const createFloorConfiguration = (floorCount = 1) => {
  return Array.from({ length: floorCount }, (_, index) => ({
    floor: index + 1,
    rooms: createInitialRooms(),
  }));
};

const toNumber = (value) => {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
};

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function SectionHeader({ step, title, subtitle, completed = false }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.stepCircle}>
        {completed ? (
          <Ionicons name="checkmark" size={17} color="#FFFFFF" />
        ) : (
          <Text style={styles.stepNumber}>{step}</Text>
        )}
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

function NumberField({
  label,
  value,
  onChangeText,
  placeholder = "0",
  suffix,
  helper,
  keyboardType = "numeric",
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          value={String(value ?? "")}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          style={styles.input}
        />

        {suffix ? (
          <View style={styles.inputSuffix}>
            <Text style={styles.inputSuffixText}>{suffix}</Text>
          </View>
        ) : null}
      </View>

      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
  helper,
}) {
  const [visible, setVisible] = useState(false);

  const selectedOption =
    options.find((item) => item.value === value) || options[0];

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.dropdown}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedOption?.label || "Select"}
        </Text>

        <Ionicons
          name="chevron-down"
          size={19}
          color="#64748B"
        />
      </TouchableOpacity>

      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.dropdownSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>{label}</Text>

            {options.map((option) => {
              const selected = option.value === value;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.8}
                  style={[
                    styles.dropdownOption,
                    selected && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selected && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#2563EB"
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.toggleSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#CBD5E1",
          true: "#93C5FD",
        }}
        thumbColor={value ? "#2563EB" : "#F8FAFC"}
      />
    </View>
  );
}

function MetricCard({
  label,
  value,
  icon,
  wide = false,
}) {
  return (
    <View style={[styles.metricCard, wide && styles.metricCardWide]}>
      <View style={styles.metricIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#2563EB"
        />
      </View>

      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ValidationRow({
  label,
  value,
  status,
}) {
  const success = status === "pass";

  return (
    <View style={styles.validationRow}>
      <View
        style={[
          styles.validationIcon,
          success
            ? styles.validationSuccess
            : styles.validationWarning,
        ]}
      >
        <Ionicons
          name={success ? "checkmark" : "alert"}
          size={15}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.validationTextContainer}>
        <Text style={styles.validationLabel}>{label}</Text>
        <Text style={styles.validationValue}>{value}</Text>
      </View>
    </View>
  );
}

function RoomEditor({
  room,
  config,
  onChange,
}) {
  const currentRoom = config.rooms[room.key];

  return (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomIcon}>
          <Ionicons
            name={room.icon}
            size={19}
            color="#2563EB"
          />
        </View>

        <Text style={styles.roomTitle}>{room.label}</Text>
      </View>

      <View style={styles.roomInputs}>
        <View style={styles.roomInputBlock}>
          <Text style={styles.roomInputLabel}>No. of rooms</Text>

          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const next = clamp(
                  toNumber(currentRoom.count) - 1,
                  0,
                  20
                );

                onChange({
                  ...currentRoom,
                  count: next,
                });
              }}
            >
              <Ionicons
                name="remove"
                size={17}
                color="#334155"
              />
            </TouchableOpacity>

            <Text style={styles.counterValue}>
              {currentRoom.count}
            </Text>

            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const next = clamp(
                  toNumber(currentRoom.count) + 1,
                  0,
                  20
                );

                onChange({
                  ...currentRoom,
                  count: next,
                });
              }}
            >
              <Ionicons
                name="add"
                size={17}
                color="#334155"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roomInputBlock}>
          <Text style={styles.roomInputLabel}>Area / room</Text>

          <View style={styles.smallInputWrapper}>
            <TextInput
              value={String(currentRoom.area ?? "")}
              onChangeText={(text) =>
                onChange({
                  ...currentRoom,
                  area: text,
                })
              }
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
              style={styles.smallInput}
            />

            <Text style={styles.smallInputSuffix}>sqft</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function CostEstimatorScreen({ route }) {
  /* -------------------------------------------------------
     STEP
  ------------------------------------------------------- */

  const [activeStep, setActiveStep] = useState(1);

  /* -------------------------------------------------------
     LAND INFORMATION
  ------------------------------------------------------- */

  const [landLength, setLandLength] = useState("");
  const [landWidth, setLandWidth] = useState("");

  // Land dimensions can be feet or meter.
  const [dimensionUnit, setDimensionUnit] = useState("ft");

  const [roadWidth, setRoadWidth] = useState("");
  const [roadFacing, setRoadFacing] = useState("front");

  const [authority, setAuthority] = useState("rajuk");
  const [buildingType, setBuildingType] =
    useState("residential");

  /* -------------------------------------------------------
     REGULATION
  ------------------------------------------------------- */

  const [regulation, setRegulation] = useState(null);
  const [regulationLoading, setRegulationLoading] =
    useState(false);

  const [regulationError, setRegulationError] =
    useState("");

  /* -------------------------------------------------------
     FLOOR / ROOM CONFIGURATION
  ------------------------------------------------------- */

  const [floorCount, setFloorCount] = useState("1");

  const [allowancePercent, setAllowancePercent] =
    useState("20");

  const [floors, setFloors] = useState(
    createFloorConfiguration(1)
  );

  /* -------------------------------------------------------
     COST SETTINGS
  ------------------------------------------------------- */

  const [quality, setQuality] = useState("standard");

  const [hasBasement, setHasBasement] =
    useState(false);

  const [hasGarage, setHasGarage] =
    useState(false);

  const [costRates, setCostRates] = useState(null);

  const [ratesLoading, setRatesLoading] =
    useState(false);

  /* -------------------------------------------------------
     RESULT
  ------------------------------------------------------- */

  const [estimateResult, setEstimateResult] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");

  const [error, setError] = useState("");

  /* =======================================================
     DERIVED LAND AREA
  ======================================================= */

  const landArea = useMemo(() => {
    return calculateLandArea({
      length: toNumber(landLength),
      width: toNumber(landWidth),
      unit: dimensionUnit,
    });
  }, [
    landLength,
    landWidth,
    dimensionUnit,
  ]);

  /* =======================================================
     FLOOR COUNT UPDATE
  ======================================================= */

  useEffect(() => {
    const count = clamp(
      Math.round(toNumber(floorCount)) || 1,
      1,
      30
    );

    setFloors((previous) => {
      const next = [...previous];

      if (count > next.length) {
        for (
          let index = next.length;
          index < count;
          index += 1
        ) {
          next.push({
            floor: index + 1,
            rooms: createInitialRooms(),
          });
        }
      } else if (count < next.length) {
        next.length = count;
      }

      return next.map((floor, index) => ({
        ...floor,
        floor: index + 1,
      }));
    });
  }, [floorCount]);

  /* =======================================================
     LOAD REGULATION PREVIEW
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadRules() {
      if (
        !toNumber(landLength) ||
        !toNumber(landWidth)
      ) {
        setRegulation(null);
        return;
      }

      setRegulationLoading(true);
      setRegulationError("");

      try {
        const backendRules =
          await fetchRegulationRules({
            authority,
            buildingType,
            roadWidth: toNumber(roadWidth),
          });

        if (mounted && backendRules) {
          setRegulation(backendRules);
        } else if (mounted) {
          setRegulation(
            getRegulationRules({
              authority,
              buildingType,
              roadWidth: toNumber(roadWidth),
            })
          );
        }
      } catch (requestError) {
        if (!mounted) return;

        setRegulationError(
          "Live regulation data unavailable. Demo rules are being shown for testing."
        );

        setRegulation(
          getRegulationRules({
            authority,
            buildingType,
            roadWidth: toNumber(roadWidth),
          })
        );
      } finally {
        if (mounted) {
          setRegulationLoading(false);
        }
      }
    }

    loadRules();

    return () => {
      mounted = false;
    };
  }, [
    authority,
    buildingType,
    roadWidth,
    landLength,
    landWidth,
  ]);

  /* =======================================================
     LOAD COST RATES
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadRates() {
      setRatesLoading(true);

      try {
        const backendRates =
          await fetchCostRates({
            quality,
            buildingType,
          });

        if (mounted && backendRates) {
          setCostRates(backendRates);
        } else if (mounted) {
          setCostRates(
            getCostRates(
              quality,
              buildingType
            )
          );
        }
      } catch (requestError) {
        if (mounted) {
          setCostRates(
            getCostRates(
              quality,
              buildingType
            )
          );
        }
      } finally {
        if (mounted) {
          setRatesLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      mounted = false;
    };
  }, [quality, buildingType]);

  /* =======================================================
     BUILDABLE FOOTPRINT PREVIEW
  ======================================================= */

  const buildablePreview = useMemo(() => {
    if (!regulation || !landArea) {
      return null;
    }

    return calculateBuildableFootprint({
      landLength: toNumber(landLength),
      landWidth: toNumber(landWidth),
      dimensionUnit,
      roadFacing,
      rules: regulation,
    });
  }, [
    regulation,
    landArea,
    landLength,
    landWidth,
    dimensionUnit,
    roadFacing,
  ]);

  /* =======================================================
     FLOOR TOTAL PREVIEW
  ======================================================= */

  const floorPreview = useMemo(() => {
    return floors.map((floor) => {
      const roomArea = calculateRoomArea(
        floor.rooms
      );

      const grossArea =
        calculateGrossFloorArea(
          roomArea,
          toNumber(allowancePercent)
        );

      return {
        floor: floor.floor,
        roomArea,
        grossArea,
      };
    });
  }, [floors, allowancePercent]);

  /* =======================================================
     UPDATE ROOM
  ======================================================= */

  const updateRoom = (
    floorIndex,
    roomKey,
    value
  ) => {
    setFloors((previous) =>
      previous.map((floor, index) => {
        if (index !== floorIndex) {
          return floor;
        }

        return {
          ...floor,
          rooms: {
            ...floor.rooms,
            [roomKey]: value,
          },
        };
      })
    );
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetEstimator = () => {
    setActiveStep(1);

    setLandLength("");
    setLandWidth("");
    setDimensionUnit("ft");

    setRoadWidth("");
    setRoadFacing("front");

    setAuthority("rajuk");
    setBuildingType("residential");

    setFloorCount("1");
    setAllowancePercent("20");

    setFloors(
      createFloorConfiguration(1)
    );

    setQuality("standard");
    setHasBasement(false);
    setHasGarage(false);

    setEstimateResult(null);

    setSaveMessage("");
    setError("");
    setRegulationError("");
  };

  /* =======================================================
     STEP VALIDATION
  ======================================================= */

  const validateLandSection = () => {
    if (toNumber(landLength) <= 0) {
      setError("Please enter valid land length.");
      return false;
    }

    if (toNumber(landWidth) <= 0) {
      setError("Please enter valid land width.");
      return false;
    }

    if (toNumber(roadWidth) <= 0) {
      setError("Please enter road width.");
      return false;
    }

    setError("");
    return true;
  };

  const validateRooms = () => {
    const count = clamp(
      Math.round(toNumber(floorCount)) || 1,
      1,
      30
    );

    if (count < 1) {
      setError("At least one floor is required.");
      return false;
    }

    for (const floor of floors) {
      for (const room of ROOM_TYPES) {
        const config = floor.rooms[room.key];

        if (
          toNumber(config.count) > 0 &&
          toNumber(config.area) <= 0
        ) {
          setError(
            `Please enter a valid area for ${room.label} on Floor ${floor.floor}.`
          );

          return false;
        }
      }
    }

    setError("");
    return true;
  };

  /* =======================================================
     GO TO STEP
  ======================================================= */

  const goToStep = (step) => {
    if (step === 2) {
      if (!validateLandSection()) return;
    }

    if (step === 3) {
      if (!validateLandSection()) return;
    }

    if (step === 4) {
      if (!validateLandSection()) return;

      if (!validateRooms()) return;
    }

    setError("");
    setActiveStep(step);
  };

  /* =======================================================
     CALCULATE ESTIMATE
  ======================================================= */

  const handleCalculate = async () => {
    if (!validateLandSection()) {
      setActiveStep(1);
      return;
    }

    if (!validateRooms()) {
      setActiveStep(3);
      return;
    }

    setError("");
    setSaveMessage("");
    setSaving(true);

    try {
      const rules =
        regulation ||
        getRegulationRules({
          authority,
          buildingType,
          roadWidth: toNumber(roadWidth),
        });

      const rates =
        costRates ||
        getCostRates(
          quality,
          buildingType
        );

      const result = calculateEstimate({
        land: {
          length: toNumber(landLength),
          width: toNumber(landWidth),
          unit: dimensionUnit,
          roadWidth: toNumber(roadWidth),
          roadFacing,
        },

        authority,
        buildingType,

        floors,

        allowancePercent:
          toNumber(allowancePercent),

        quality,

        hasBasement,
        hasGarage,

        rules,
        rates,
      });

      setEstimateResult(result);
      setActiveStep(5);

      /* -----------------------------------------------
         SAVE TO BACKEND
      ------------------------------------------------ */

      try {
        const saved = await saveEstimate({
          ...result,
          input: {
            landLength: toNumber(landLength),
            landWidth: toNumber(landWidth),
            dimensionUnit,
            roadWidth: toNumber(roadWidth),
            roadFacing,
            authority,
            buildingType,
            floorCount:
              toNumber(floorCount),
            allowancePercent:
              toNumber(allowancePercent),
            floors,
            quality,
            hasBasement,
            hasGarage,
          },
        });

        if (saved?.id) {
          setSaveMessage(
            `Estimate saved successfully. ID: ${saved.id}`
          );
        } else {
          setSaveMessage(
            "Estimate calculated successfully."
          );
        }
      } catch (saveError) {
        setSaveMessage(
          "Estimate calculated successfully. Saving to backend is currently unavailable."
        );
      }
    } catch (calculationError) {
      setError(
        calculationError?.message ||
          "Unable to calculate estimate."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     RESULT DATA
  ======================================================= */

  const result = estimateResult;

  const compliancePassed =
    result?.compliance?.isCompliant === true;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="calculator-outline"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Bangladesh Cost Estimator
            </Text>

            <Text style={styles.headerSubtitle}>
              Land, regulation, floor planning & construction cost
            </Text>
          </View>
        </View>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <View style={styles.progressCard}>
          {[
            {
              number: 1,
              label: "Land",
            },
            {
              number: 2,
              label: "Rules",
            },
            {
              number: 3,
              label: "Floors",
            },
            {
              number: 4,
              label: "Cost",
            },
            {
              number: 5,
              label: "Result",
            },
          ].map((item, index, array) => {
            const active =
              activeStep >= item.number;

            return (
              <React.Fragment key={item.number}>
                <TouchableOpacity
                  style={styles.progressItem}
                  onPress={() =>
                    goToStep(item.number)
                  }
                >
                  <View
                    style={[
                      styles.progressCircle,
                      active &&
                        styles.progressCircleActive,
                    ]}
                  >
                    {activeStep >
                    item.number ? (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.progressNumber,
                          active &&
                            styles.progressNumberActive,
                        ]}
                      >
                        {item.number}
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.progressLabel,
                      active &&
                        styles.progressLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>

                {index <
                array.length - 1 ? (
                  <View
                    style={[
                      styles.progressLine,
                      activeStep >
                        item.number &&
                        styles.progressLineActive,
                    ]}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color="#B91C1C"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* =================================================
            STEP 1 - LAND
        ================================================= */}

        {activeStep === 1 ? (
          <View style={styles.sectionCard}>
            <SectionHeader
              step="1"
              title="Land Information"
              subtitle="Start with the actual plot dimensions and road access."
            />

            <View style={styles.infoBanner}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2563EB"
              />

              <Text style={styles.infoText}>
                Enter the land dimensions first. The estimator will
                use the selected authority and building type to
                determine the preliminary buildable area.
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <NumberField
                  label="Land Length"
                  value={landLength}
                  onChangeText={setLandLength}
                  placeholder="e.g. 50"
                  suffix={dimensionUnit}
                />
              </View>

              <View style={styles.halfColumn}>
                <NumberField
                  label="Land Width"
                  value={landWidth}
                  onChangeText={setLandWidth}
                  placeholder="e.g. 40"
                  suffix={dimensionUnit}
                />
              </View>
            </View>

            <View style={styles.unitSelectorContainer}>
              <Text style={styles.fieldLabel}>
                Dimension Unit
              </Text>

              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segment,
                    dimensionUnit === "ft" &&
                      styles.segmentActive,
                  ]}
                  onPress={() =>
                    setDimensionUnit("ft")
                  }
                >
                  <Text
                    style={[
                      styles.segmentText,
                      dimensionUnit === "ft" &&
                        styles.segmentTextActive,
                    ]}
                  >
                    Feet
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segment,
                    dimensionUnit === "m" &&
                      styles.segmentActive,
                  ]}
                  onPress={() =>
                    setDimensionUnit("m")
                  }
                >
                  <Text
                    style={[
                      styles.segmentText,
                      dimensionUnit === "m" &&
                        styles.segmentTextActive,
                    ]}
                  >
                    Meter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.areaPreview}>
              <View>
                <Text style={styles.areaPreviewLabel}>
                  Total Land Area
                </Text>

                <Text style={styles.areaPreviewValue}>
                  {landArea > 0
                    ? formatSqft(landArea)
                    : "0 sqft"}
                </Text>
              </View>

              <View style={styles.areaPreviewIcon}>
                <Ionicons
                  name="map-outline"
                  size={23}
                  color="#2563EB"
                />
              </View>
            </View>

            <View style={styles.divider} />

            <NumberField
              label="Road Width"
              value={roadWidth}
              onChangeText={setRoadWidth}
              placeholder="e.g. 20"
              suffix="ft"
              helper="Road width is entered separately in feet."
            />

            <Dropdown
              label="Road-Facing Side"
              value={roadFacing}
              options={ROAD_SIDES}
              onChange={setRoadFacing}
            />

            <Dropdown
              label="Development Authority"
              value={authority}
              options={AUTHORITIES}
              onChange={setAuthority}
            />

            <Dropdown
              label="Building Type"
              value={buildingType}
              options={BUILDING_TYPES}
              onChange={setBuildingType}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={() => goToStep(2)}
            >
              <Text style={styles.primaryButtonText}>
                Continue to Building Rules
              </Text>

              <Ionicons
                name="arrow-forward"
                size={19}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            STEP 2 - RULES
        ================================================= */}

        {activeStep === 2 ? (
          <View style={styles.sectionCard}>
            <SectionHeader
              step="2"
              title="Regulatory Building Area"
              subtitle="Review preliminary coverage, FAR and setback inputs."
            />

            {regulationLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

                <Text style={styles.loadingText}>
                  Loading regulation data...
                </Text>
              </View>
            ) : null}

            {regulationError ? (
              <View style={styles.warningBanner}>
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color="#B45309"
                />

                <Text style={styles.warningText}>
                  {regulationError}
                </Text>
              </View>
            ) : null}

            {regulation ? (
              <>
                <View style={styles.ruleGrid}>
                  <MetricCard
                    label="Coverage"
                    value={`${(
                      toNumber(
                        regulation.coverage
                      ) * 100
                    ).toFixed(0)}%`}
                    icon="resize-outline"
                  />

                  <MetricCard
                    label="FAR"
                    value={String(
                      regulation.far ?? "-"
                    )}
                    icon="layers-outline"
                  />

                  <MetricCard
                    label="Front Setback"
                    value={`${regulation.frontSetback ?? "-"} ft`}
                    icon="arrow-back-outline"
                  />

                  <MetricCard
                    label="Rear Setback"
                    value={`${regulation.rearSetback ?? "-"} ft`}
                    icon="arrow-forward-outline"
                  />

                  <MetricCard
                    label="Side Setback"
                    value={`${regulation.sideSetback ?? "-"} ft`}
                    icon="swap-horizontal-outline"
                    wide
                  />
                </View>

                {buildablePreview ? (
                  <View style={styles.buildableCard}>
                    <View style={styles.buildableHeader}>
                      <View>
                        <Text style={styles.buildableLabel}>
                          Maximum Preliminary Buildable Footprint
                        </Text>

                        <Text style={styles.buildableValue}>
                          {formatSqft(
                            buildablePreview.maxFootprint
                          )}
                        </Text>
                      </View>

                      <View style={styles.buildableIcon}>
                        <Ionicons
                          name="business-outline"
                          size={25}
                          color="#2563EB"
                        />
                      </View>
                    </View>

                    <View style={styles.buildableDivider} />

                    <View style={styles.buildableRow}>
                      <Text style={styles.buildableRowLabel}>
                        Coverage limit
                      </Text>

                      <Text style={styles.buildableRowValue}>
                        {formatSqft(
                          buildablePreview.coverageArea
                        )}
                      </Text>
                    </View>

                    <View style={styles.buildableRow}>
                      <Text style={styles.buildableRowLabel}>
                        Setback-adjusted area
                      </Text>

                      <Text style={styles.buildableRowValue}>
                        {formatSqft(
                          buildablePreview.setbackArea
                        )}
                      </Text>
                    </View>

                    <View style={styles.buildableRow}>
                      <Text style={styles.buildableRowLabel}>
                        Maximum footprint
                      </Text>

                      <Text style={styles.buildableRowValueStrong}>
                        {formatSqft(
                          buildablePreview.maxFootprint
                        )}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <View style={styles.demoNote}>
                  <Ionicons
                    name="flask-outline"
                    size={19}
                    color="#B45309"
                  />

                  <Text style={styles.demoNoteText}>
                    The current frontend demo uses sample regulation
                    values for testing. These values must be replaced
                    with verified authority-specific rules before
                    production use.
                  </Text>
                </View>
              </>
            ) : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryButton}
                onPress={() => setActiveStep(1)}
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color="#334155"
                />

                <Text style={styles.secondaryButtonText}>
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryButtonFlex}
                onPress={() => goToStep(3)}
              >
                <Text style={styles.primaryButtonText}>
                  Configure Floors
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* =================================================
            STEP 3 - FLOORS
        ================================================= */}

        {activeStep === 3 ? (
          <View style={styles.sectionCard}>
            <SectionHeader
              step="3"
              title="Floor-wise Room Configuration"
              subtitle="Define rooms and their approximate area for every floor."
            />

            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <NumberField
                  label="Number of Floors"
                  value={floorCount}
                  onChangeText={(text) =>
                    setFloorCount(
                      text.replace(/[^0-9]/g, "")
                    )
                  }
                  placeholder="1"
                  suffix="floors"
                />
              </View>

              <View style={styles.halfColumn}>
                <NumberField
                  label="Wall / Circulation Allowance"
                  value={allowancePercent}
                  onChangeText={setAllowancePercent}
                  placeholder="20"
                  suffix="%"
                  helper="Added over net room area."
                />
              </View>
            </View>

            <View style={styles.infoBanner}>
              <Ionicons
                name="construct-outline"
                size={20}
                color="#2563EB"
              />

              <Text style={styles.infoText}>
                Room areas are used to estimate net usable area.
                The allowance adds circulation, wall and service
                space to produce gross floor area.
              </Text>
            </View>

            {floors.map((floor, floorIndex) => {
              const preview = floorPreview[
                floorIndex
              ];

              return (
                <View
                  key={`floor-${floor.floor}`}
                  style={styles.floorCard}
                >
                  <View style={styles.floorHeader}>
                    <View>
                      <Text style={styles.floorTitle}>
                        Floor {floor.floor}
                      </Text>

                      <Text style={styles.floorSubtitle}>
                        Net rooms:{" "}
                        {formatSqft(
                          preview?.roomArea || 0
                        )}{" "}
                        · Gross:{" "}
                        {formatSqft(
                          preview?.grossArea || 0
                        )}
                      </Text>
                    </View>

                    <View style={styles.floorBadge}>
                      <Text style={styles.floorBadgeText}>
                        {floor.floor === 1
                          ? "Ground"
                          : `Level ${floor.floor}`}
                      </Text>
                    </View>
                  </View>

                  {ROOM_TYPES.map((room) => (
                    <RoomEditor
                      key={room.key}
                      room={room}
                      config={floor}
                      onChange={(value) =>
                        updateRoom(
                          floorIndex,
                          room.key,
                          value
                        )
                      }
                    />
                  ))}
                </View>
              );
            })}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryButton}
                onPress={() => setActiveStep(2)}
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color="#334155"
                />

                <Text style={styles.secondaryButtonText}>
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryButtonFlex}
                onPress={() => goToStep(4)}
              >
                <Text style={styles.primaryButtonText}>
                  Continue to Cost
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* =================================================
            STEP 4 - COST
        ================================================= */}

        {activeStep === 4 ? (
          <View style={styles.sectionCard}>
            <SectionHeader
              step="4"
              title="Construction Cost Basis"
              subtitle="Choose quality and additional construction components."
            />

            <Text style={styles.fieldLabel}>
              Construction Quality
            </Text>

            <View style={styles.qualityContainer}>
              {QUALITY_OPTIONS.map((option) => {
                const selected =
                  option.value === quality;

                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.85}
                    style={[
                      styles.qualityCard,
                      selected &&
                        styles.qualityCardSelected,
                    ]}
                    onPress={() =>
                      setQuality(option.value)
                    }
                  >
                    <View
                      style={[
                        styles.qualityRadio,
                        selected &&
                          styles.qualityRadioSelected,
                      ]}
                    >
                      {selected ? (
                        <View style={styles.qualityRadioDot} />
                      ) : null}
                    </View>

                    <Text
                      style={[
                        styles.qualityTitle,
                        selected &&
                          styles.qualityTitleSelected,
                      ]}
                    >
                      {option.label}
                    </Text>

                    <Text style={styles.qualityRate}>
                      ৳
                      {Number(
                        option.rate || 0
                      ).toLocaleString()}
                      / sqft
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.rateNote}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color="#2563EB"
              />

              <Text style={styles.rateNoteText}>
                The displayed rate is a demo/reference rate for
                frontend testing. Production rates should come from
                a verified and dated rate database.
              </Text>
            </View>

            <View style={styles.divider} />

            <ToggleRow
              title="Basement"
              subtitle="Include preliminary basement construction cost."
              value={hasBasement}
              onValueChange={setHasBasement}
            />

            <View style={styles.divider} />

            <ToggleRow
              title="Garage"
              subtitle="Include a preliminary garage component."
              value={hasGarage}
              onValueChange={setHasGarage}
            />

            <View style={styles.divider} />

            {ratesLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

                <Text style={styles.loadingText}>
                  Loading current rate profile...
                </Text>
              </View>
            ) : null}

            {costRates ? (
              <View style={styles.ratePreviewCard}>
                <Text style={styles.ratePreviewTitle}>
                  Selected Rate Profile
                </Text>

                <View style={styles.ratePreviewRow}>
                  <Text style={styles.ratePreviewLabel}>
                    Base rate
                  </Text>

                  <Text style={styles.ratePreviewValue}>
                    {formatBDT(
                      costRates.ratePerSqft
                    )}{" "}
                    / sqft
                  </Text>
                </View>

                <View style={styles.ratePreviewRow}>
                  <Text style={styles.ratePreviewLabel}>
                    Source
                  </Text>

                  <Text style={styles.ratePreviewValue}>
                    {costRates.source ||
                      "Demo profile"}
                  </Text>
                </View>

                <View style={styles.ratePreviewRow}>
                  <Text style={styles.ratePreviewLabel}>
                    Effective date
                  </Text>

                  <Text style={styles.ratePreviewValue}>
                    {costRates.effectiveDate ||
                      "Not specified"}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryButton}
                onPress={() => setActiveStep(3)}
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color="#334155"
                />

                <Text style={styles.secondaryButtonText}>
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryButtonFlex}
                onPress={handleCalculate}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="calculator-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text style={styles.primaryButtonText}>
                      Calculate Estimate
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* =================================================
            STEP 5 - RESULT
        ================================================= */}

        {activeStep === 5 && result ? (
          <>
            <View style={styles.resultHero}>
              <View style={styles.resultHeroTop}>
                <View>
                  <Text style={styles.resultEyebrow}>
                    PRELIMINARY ESTIMATE
                  </Text>

                  <Text style={styles.resultTitle}>
                    {formatBDT(
                      result.totalCost || 0
                    )}
                  </Text>

                  <Text style={styles.resultSubtitle}>
                    Estimated construction cost
                  </Text>
                </View>

                <View
                  style={[
                    styles.complianceBadge,
                    compliancePassed
                      ? styles.complianceBadgeSuccess
                      : styles.complianceBadgeWarning,
                  ]}
                >
                  <Ionicons
                    name={
                      compliancePassed
                        ? "checkmark-circle"
                        : "warning"
                    }
                    size={18}
                    color={
                      compliancePassed
                        ? "#166534"
                        : "#92400E"
                    }
                  />

                  <Text
                    style={[
                      styles.complianceBadgeText,
                      compliancePassed
                        ? styles.complianceSuccessText
                        : styles.complianceWarningText,
                    ]}
                  >
                    {compliancePassed
                      ? "Compliant"
                      : "Review Required"}
                  </Text>
                </View>
              </View>

              <View style={styles.resultHeroDivider} />

              <View style={styles.resultHeroMeta}>
                <Text style={styles.resultMetaText}>
                  {buildingType}
                </Text>

                <Text style={styles.resultMetaDot}>
                  •
                </Text>

                <Text style={styles.resultMetaText}>
                  {quality}
                </Text>

                <Text style={styles.resultMetaDot}>
                  •
                </Text>

                <Text style={styles.resultMetaText}>
                  {floorCount} floor
                  {toNumber(floorCount) > 1
                    ? "s"
                    : ""}
                </Text>
              </View>
            </View>

            {saveMessage ? (
              <View style={styles.successBanner}>
                <Ionicons
                  name="cloud-done-outline"
                  size={20}
                  color="#166534"
                />

                <Text style={styles.successText}>
                  {saveMessage}
                </Text>
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <SectionHeader
                step="✓"
                title="Project Summary"
                subtitle="Key areas used for this estimate."
                completed
              />

              <View style={styles.metricGrid}>
                <MetricCard
                  label="Land Area"
                  value={formatSqft(
                    result.landArea || 0
                  )}
                  icon="map-outline"
                />

                <MetricCard
                  label="Buildable Footprint"
                  value={formatSqft(
                    result.maxBuildableFootprint ||
                      0
                  )}
                  icon="business-outline"
                />

                <MetricCard
                  label="Proposed Ground"
                  value={formatSqft(
                    result.proposedGroundArea ||
                      0
                  )}
                  icon="home-outline"
                />

                <MetricCard
                  label="Total Gross Area"
                  value={formatSqft(
                    result.totalGrossFloorArea ||
                      0
                  )}
                  icon="layers-outline"
                />

                <MetricCard
                  label="FAR Maximum"
                  value={formatSqft(
                    result.maxFarArea || 0
                  )}
                  icon="expand-outline"
                  wide
                />

                <MetricCard
                  label="Rate"
                  value={`${formatBDT(
                    result.ratePerSqft || 0
                  )}/sqft`}
                  icon="cash-outline"
                  wide
                />
              </View>
            </View>

            <View style={styles.sectionCard}>
              <SectionHeader
                step="✓"
                title="Regulatory Validation"
                subtitle="Preliminary checks against the selected rule profile."
                completed
              />

              {result.validation?.map(
                (item, index) => (
                  <ValidationRow
                    key={`validation-${index}`}
                    label={item.label}
                    value={item.value}
                    status={item.status}
                  />
                )
              )}

              <View style={styles.warningBanner}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#B45309"
                />

                <Text style={styles.warningText}>
                  This is a preliminary planning estimate, not an
                  approval or legal confirmation. Final design must
                  be checked against the applicable authority rules
                  and approved by qualified professionals.
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <SectionHeader
                step="✓"
                title="Detailed Cost Breakdown"
                subtitle="Estimated distribution of the construction budget."
                completed
              />

              {result.breakdown?.map(
                (item, index) => (
                  <View
                    key={`breakdown-${index}`}
                    style={styles.breakdownRow}
                  >
                    <View style={styles.breakdownLeft}>
                      <View style={styles.breakdownDot}>
                        <Ionicons
                          name="ellipse"
                          size={8}
                          color="#2563EB"
                        />
                      </View>

                      <View>
                        <Text style={styles.breakdownTitle}>
                          {item.label}
                        </Text>

                        <Text style={styles.breakdownPercent}>
                          {Number(
                            item.percentage || 0
                          ).toFixed(1)}
                          %
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.breakdownValue}>
                      {formatBDT(
                        item.amount || 0
                      )}
                    </Text>
                  </View>
                )
              )}
            </View>

            <View style={styles.sectionCard}>
              <SectionHeader
                step="✓"
                title="Floor-by-Floor Area"
                subtitle="Gross floor area including the selected allowance."
                completed
              />

              {result.floorBreakdown?.map(
                (floor) => (
                  <View
                    key={`floor-result-${floor.floor}`}
                    style={styles.floorResult}
                  >
                    <View>
                      <Text style={styles.floorResultTitle}>
                        Floor {floor.floor}
                      </Text>

                      <Text style={styles.floorResultSub}>
                        Net room area:{" "}
                        {formatSqft(
                          floor.netRoomArea || 0
                        )}
                      </Text>
                    </View>

                    <View style={styles.floorResultRight}>
                      <Text style={styles.floorResultGross}>
                        {formatSqft(
                          floor.grossArea || 0
                        )}
                      </Text>

                      <Text style={styles.floorResultUnit}>
                        gross area
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            <View style={styles.sectionCard}>
              <SectionHeader
                step="i"
                title="Sources & Disclaimer"
                subtitle="Important information before using this estimate."
              />

              <View style={styles.disclaimerItem}>
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color="#64748B"
                />

                <Text style={styles.disclaimerText}>
                  Regulation source:{" "}
                  {result.rules?.source ||
                    "Demo regulation profile"}
                  .
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#64748B"
                />

                <Text style={styles.disclaimerText}>
                  Regulation effective date:{" "}
                  {result.rules?.effectiveDate ||
                    "Not specified"}
                  .
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons
                  name="cash-outline"
                  size={19}
                  color="#64748B"
                />

                <Text style={styles.disclaimerText}>
                  Cost rate source:{" "}
                  {result.rates?.source ||
                    "Demo rate profile"}
                  .
                </Text>
              </View>

              <View style={styles.disclaimerItem}>
                <Ionicons
                  name="warning-outline"
                  size={19}
                  color="#64748B"
                />

                <Text style={styles.disclaimerText}>
                  Actual construction cost can vary because of
                  location, soil condition, structural design,
                  materials, labor, finishes, utility work,
                  market prices and authority requirements.
                </Text>
              </View>
            </View>

            {/* RESULT ACTIONS */}

            <View style={styles.resultActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryButton}
                onPress={() => {
                  setActiveStep(1);
                  setEstimateResult(null);
                  setSaveMessage("");
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryButtonText}>
                  Edit Estimate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.resetButton}
                onPress={resetEstimator}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color="#334155"
                />

                <Text style={styles.resetButtonText}>
                  Start New Estimate
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* =================================================
            FOOTER
        ================================================= */}

        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#94A3B8"
          />

          <Text style={styles.footerText}>
            CivilHub Cost Estimator · Preliminary planning tool
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  header: {
    backgroundColor: "#1E293B",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  /* -------------------------------------------------------
     PROGRESS
  ------------------------------------------------------- */

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  progressItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
  },

  progressCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  progressCircleActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  progressNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },

  progressNumberActive: {
    color: "#FFFFFF",
  },

  progressLabel: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 5,
    fontWeight: "600",
  },

  progressLabelActive: {
    color: "#2563EB",
  },

  progressLine: {
    height: 1,
    backgroundColor: "#E2E8F0",
    flex: 1,
    marginHorizontal: 2,
    marginBottom: 17,
  },

  progressLineActive: {
    backgroundColor: "#2563EB",
  },

  /* -------------------------------------------------------
     ERROR / INFO
  ------------------------------------------------------- */

  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 9,
    fontWeight: "600",
  },

  infoBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  infoText: {
    flex: 1,
    color: "#1E40AF",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 9,
  },

  warningBanner: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
  },

  warningText: {
    flex: 1,
    color: "#92400E",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 9,
  },

  successBanner: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  successText: {
    flex: 1,
    color: "#166534",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 9,
    fontWeight: "600",
  },

  /* -------------------------------------------------------
     SECTION CARD
  ------------------------------------------------------- */

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  stepNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },

  sectionSubtitle: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  /* -------------------------------------------------------
     FORM
  ------------------------------------------------------- */

  row: {
    flexDirection: "row",
    gap: 10,
  },

  halfColumn: {
    flex: 1,
  },

  fieldContainer: {
    marginBottom: 15,
  },

  fieldLabel: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },

  inputWrapper: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 13,
    color: "#0F172A",
    fontSize: 14,
  },

  inputSuffix: {
    paddingHorizontal: 11,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
  },

  inputSuffixText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },

  helperText: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 5,
    lineHeight: 15,
  },

  dropdown: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  dropdownText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
  },

  unitSelectorContainer: {
    marginBottom: 15,
  },

  segmentedControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    overflow: "hidden",
  },

  segment: {
    flex: 1,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  segmentActive: {
    backgroundColor: "#EFF6FF",
  },

  segmentText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },

  segmentTextActive: {
    color: "#2563EB",
  },

  areaPreview: {
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  areaPreviewLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },

  areaPreviewValue: {
    color: "#1E293B",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 4,
  },

  areaPreviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 5,
  },

  /* -------------------------------------------------------
     BUTTONS
  ------------------------------------------------------- */

  primaryButton: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 17,
    marginTop: 8,
  },

  primaryButtonFlex: {
    flex: 1,
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginHorizontal: 7,
  },

  secondaryButton: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 17,
  },

  secondaryButtonText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  resetButton: {
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 17,
    marginTop: 10,
  },

  resetButtonText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  /* -------------------------------------------------------
     RULES
  ------------------------------------------------------- */

  ruleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 15,
  },

  metricCard: {
    width: "48.5%",
    minHeight: 94,
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  metricCardWide: {
    width: "100%",
  },

  metricIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  metricLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  metricValue: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },

  buildableCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  buildableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buildableLabel: {
    color: "#1E40AF",
    fontSize: 11,
    fontWeight: "700",
  },

  buildableValue: {
    color: "#1E3A8A",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },

  buildableIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  buildableDivider: {
    height: 1,
    backgroundColor: "#BFDBFE",
    marginVertical: 12,
  },

  buildableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  buildableRowLabel: {
    color: "#475569",
    fontSize: 11,
  },

  buildableRowValue: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },

  buildableRowValueStrong: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "900",
  },

  demoNote: {
    marginTop: 14,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  demoNoteText: {
    flex: 1,
    color: "#92400E",
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },

  loadingBox: {
    padding: 15,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  loadingText: {
    color: "#64748B",
    fontSize: 12,
    marginLeft: 8,
  },

  /* -------------------------------------------------------
     FLOOR / ROOM
  ------------------------------------------------------- */

  floorCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 17,
    padding: 13,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },

  floorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  floorTitle: {
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "800",
  },

  floorSubtitle: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 3,
  },

  floorBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  floorBadgeText: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "800",
  },

  roomCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    padding: 11,
    marginTop: 8,
  },

  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  roomIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  roomTitle: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },

  roomInputs: {
    flexDirection: "row",
    gap: 10,
  },

  roomInputBlock: {
    flex: 1,
  },

  roomInputLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 5,
  },

  counterContainer: {
    minHeight: 41,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  counterButton: {
    width: 37,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
  },

  counterValue: {
    color: "#1E293B",
    fontSize: 13,
    fontWeight: "800",
  },

  smallInputWrapper: {
    minHeight: 41,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  smallInput: {
    flex: 1,
    height: 41,
    paddingHorizontal: 10,
    color: "#0F172A",
    fontSize: 12,
  },

  smallInputSuffix: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
    marginRight: 9,
  },

  /* -------------------------------------------------------
     QUALITY / RATES
  ------------------------------------------------------- */

  qualityContainer: {
    gap: 9,
    marginBottom: 12,
  },

  qualityCard: {
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  qualityCardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  qualityRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  qualityRadioSelected: {
    borderColor: "#2563EB",
  },

  qualityRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  qualityTitle: {
    flex: 1,
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  qualityTitleSelected: {
    color: "#1D4ED8",
  },

  qualityRate: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  rateNote: {
    backgroundColor: "#EFF6FF",
    borderRadius: 13,
    padding: 11,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  rateNoteText: {
    flex: 1,
    color: "#1E40AF",
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },

  toggleRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toggleTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  toggleTitle: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },

  toggleSubtitle: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  ratePreviewCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 13,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  ratePreviewTitle: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },

  ratePreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  ratePreviewLabel: {
    color: "#64748B",
    fontSize: 10,
  },

  ratePreviewValue: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "800",
    maxWidth: "55%",
    textAlign: "right",
  },

  /* -------------------------------------------------------
     RESULT HERO
  ------------------------------------------------------- */

  resultHero: {
    backgroundColor: "#1E293B",
    borderRadius: 21,
    padding: 17,
    marginBottom: 14,
  },

  resultHeroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  resultEyebrow: {
    color: "#93C5FD",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  resultTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    marginTop: 4,
  },

  resultSubtitle: {
    color: "#CBD5E1",
    fontSize: 11,
    marginTop: 2,
  },

  complianceBadge: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  complianceBadgeSuccess: {
    backgroundColor: "#DCFCE7",
  },

  complianceBadgeWarning: {
    backgroundColor: "#FEF3C7",
  },

  complianceBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    marginLeft: 4,
  },

  complianceSuccessText: {
    color: "#166534",
  },

  complianceWarningText: {
    color: "#92400E",
  },

  resultHeroDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 13,
  },

  resultHeroMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  resultMetaText: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  resultMetaDot: {
    color: "#64748B",
    fontSize: 10,
    marginHorizontal: 7,
  },

  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  /* -------------------------------------------------------
     VALIDATION
  ------------------------------------------------------- */

  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  validationIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  validationSuccess: {
    backgroundColor: "#16A34A",
  },

  validationWarning: {
    backgroundColor: "#D97706",
  },

  validationTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  validationLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
  },

  validationValue: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  /* -------------------------------------------------------
     BREAKDOWN
  ------------------------------------------------------- */

  breakdownRow: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  breakdownDot: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  breakdownTitle: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "800",
  },

  breakdownPercent: {
    color: "#94A3B8",
    fontSize: 9,
    marginTop: 2,
  },

  breakdownValue: {
    color: "#1E293B",
    fontSize: 11,
    fontWeight: "900",
  },

  /* -------------------------------------------------------
     FLOOR RESULT
  ------------------------------------------------------- */

  floorResult: {
    minHeight: 62,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  floorResultTitle: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },

  floorResultSub: {
    color: "#64748B",
    fontSize: 9,
    marginTop: 3,
  },

  floorResultRight: {
    alignItems: "flex-end",
  },

  floorResultGross: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "900",
  },

  floorResultUnit: {
    color: "#94A3B8",
    fontSize: 8,
    marginTop: 2,
  },

  /* -------------------------------------------------------
     DISCLAIMER
  ------------------------------------------------------- */

  disclaimerItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 11,
  },

  disclaimerText: {
    flex: 1,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },

  /* -------------------------------------------------------
     RESULT ACTIONS
  ------------------------------------------------------- */

  resultActions: {
    marginBottom: 8,
  },

  /* -------------------------------------------------------
     MODAL
  ------------------------------------------------------- */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },

  dropdownSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 17,
    paddingBottom: 28,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 16,
  },

  sheetTitle: {
    color: "#1E293B",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },

  dropdownOption: {
    minHeight: 49,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  dropdownOptionSelected: {
    backgroundColor: "#EFF6FF",
  },

  dropdownOptionText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },

  dropdownOptionTextSelected: {
    color: "#2563EB",
    fontWeight: "800",
  },

  /* -------------------------------------------------------
     FOOTER
  ------------------------------------------------------- */

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 9,
    marginLeft: 6,
  },
});