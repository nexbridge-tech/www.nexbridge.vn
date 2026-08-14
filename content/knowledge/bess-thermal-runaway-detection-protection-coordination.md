---
layout: article.njk
title: "BESS Thermal Runaway: Detection Is Not Protection Until the Whole Response Chain Works"
date: 2026-08-12
tags: ["Energy Storage", "Functional Safety", "Thermal Management", "Technical Guides"]
topic: "Energy Storage Systems"
series: "BESS Safety & Controls"
excerpt: "A cell alarm is only the first link. Sensor placement, BMS logic, ventilation, isolation, fire strategy, remote dispatch and emergency response must operate as one timed protection chain."
image: "/assets/images/editorial/bess-commissioning.png"
draft: false
---

Thermal-runaway protection is often reviewed as a list of installed devices: temperature sensors, smoke or off-gas detection, contactors, HVAC, suppression and alarms. A list cannot show whether the response is fast enough, whether one action defeats another, or whether the system enters a safer state. The useful engineering object is a timed cause-and-effect chain from initiating fault to detection, decision, isolation, propagation control and emergency response.

## The pain point: every subsystem passes, but the hazard remains

Cell temperature is a late and local indicator when the sensor is not on the failing cell. Smoke can be later still. Off-gas may provide earlier warning but introduces placement, contamination and false-alarm questions. Pack voltage and insulation monitoring see different fault classes. No single channel covers internal cell failure, external heating, coolant leakage, connection resistance and electrical abuse.

Detection architecture should be derived from fault progression. For each initiating event, state what changes first, where it can be measured, how quickly it moves and what uncertainty exists. Diversity matters only when channels fail differently; three temperature sensors in the same thermal shadow are not three independent protections.

## Isolation has electrical and operational consequences

Opening a contactor is not automatically a safe state. DC buses retain energy. Parallel racks may back-feed. A PCS may continue regulating until its state machine receives a confirmed trip. Auxiliary supplies can keep ignition sources active. Abrupt isolation can also remove ventilation or monitoring needed to manage the event.

The cause-and-effect matrix must define command order, acknowledgement, timeout and fallback for BMS, rack controller, EMS, PCS, HVAC, fire panel and site controller. It should distinguish warning, controlled shutdown, emergency isolation and evacuation states. The same matrix must cover lost communication and contradictory sensor inputs—not assume a perfect network during a fault.

## Propagation is a layout and thermal problem

Propagation risk depends on cell chemistry, spacing, vent direction, enclosure geometry, barriers, airflow and the energy released into adjacent cells. Average container temperature says little about the local heat flux at the neighboring module. HVAC designed for normal losses may spread hot gases or feed oxygen during an abnormal event.

Validation therefore needs instrumented abuse testing at the relevant hierarchy: cell, module, rack and representative enclosure. The goal is not a dramatic pass/fail demonstration. It is to establish detection time, pressure and gas path, peak adjacent-cell exposure, isolation behavior and the assumptions required to prevent cascading failure.

## What to log

Retain high-resolution pre-trigger and post-trigger data for cell voltage, selected temperatures, insulation resistance, contactor command and feedback, current, HVAC state, detector outputs and controller clocks. Event logs sampled every few seconds are useful for operations and usually inadequate for root cause. Clock synchronization is itself a safety requirement when sequence determines whether controls or protection acted first.

## Practical exit criteria

Close the safety case only when every credible initiating event has a detectable signature, a bounded response time, a defined safe or managed state, independent confirmation that the action occurred, and a tested degraded path. If the argument depends on an operator interpreting multiple alarms correctly under time pressure, the design has transferred an engineering control into a human hope.
