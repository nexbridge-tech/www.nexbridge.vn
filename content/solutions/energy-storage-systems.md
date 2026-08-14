---
layout: solution-detail.njk
title: "Energy Storage Systems (ESS)"
eyebrow: "ENERGY STORAGE"
summary: "Close the control, safety and grid-integration gaps that appear between qualified cells, BMS, PCS, EMS and the real site."
pain_points:
  - "The project meets installed MW/MWh but misses dispatch, availability or curtailment targets."
  - "BMS, PCS and EMS limits conflict during charge, fault recovery or grid events."
  - "Thermal alarms, cell imbalance or insulation faults repeat without a defensible root cause."
  - "Commissioning exposes grid-code, communications or protection behavior not covered by FAT."
interventions:
  - title: "Architecture & interface review"
    description: "Map limits, state ownership, timing and fault behavior across cell, rack, PCS, EMS, SCADA and protection."
  - title: "Safety & thermal review"
    description: "Challenge detection, isolation, propagation, HVAC and emergency-response assumptions against credible failure sequences."
  - title: "Grid & control validation"
    description: "Define weak-grid cases, ride-through, current priority, SOC headroom and hardware-in-the-loop evidence."
  - title: "Commissioning support"
    description: "Instrument end-to-end events and close issues with synchronized evidence rather than subsystem blame."
deliverables: ["System boundary and interface-control matrix", "Protection cause-and-effect and timing review", "Grid/dispatch validation plan with acceptance criteria", "Commissioning issue register and evidence-backed closure"]
---

A grid-scale or behind-the-meter battery energy storage system is rarely at risk at the component level — cells, modules and inverters are, for the most part, mature and well-characterized technology. Where programs actually run into trouble is at the seams between those components, and in the gap between a dispatch requirement written by a developer and the grid-code behavior an interconnection authority will actually accept. Our engineering support is built around those seams, not just the components on either side of them.

![Engineering support across the full BESS chain](/assets/images/diagrams/solution-energy-storage-systems.svg)

## Cell, module and BMS qualification

Cell and module selection starts with the application's actual duty cycle — depth of discharge, cycling frequency, ambient temperature range — not a datasheet's headline cycle-life number measured under a single idealized condition. For LFP-chemistry systems at grid scale, we work through cell and module qualification documentation with the same scrutiny we'd apply to an automotive component: capacity fade curves under the application's real conditions, thermal runaway propagation testing, and BMS-level cell balancing and protection thresholds validated against the pack's actual electrical design, not just the cell vendor's reference implementation.

## Power conversion and grid-code compliance

A PCS (power conversion system) that passes its own factory acceptance test can still fail interconnection if its ride-through behavior, reactive power support, and frequency response settings weren't engineered against the specific grid code and interconnection agreement the project operates under — requirements that vary by market and by utility, and that are frequently treated as a configuration afterthought rather than a design input. We work through PCS selection and configuration, EMS/SCADA coordination, and dispatch logic validation against the project's actual grid-code and utility interconnection requirements before commissioning, not during it.

## Container integration and fire safety

Containerized and cabinet-based ESS integration is where cell-level, module-level and system-level engineering actually converge: thermal management sized for the container's real airflow and ambient conditions, fire detection and suppression systems designed around the specific cell chemistry's failure signature, and structural and electrical integration with substation and metering equipment that has to match the utility's actual interconnection point, not a generic single-line diagram. Getting this integration layer right the first time is the difference between a commissioning schedule that holds and one that slips by months over issues that were knowable in the design phase.
