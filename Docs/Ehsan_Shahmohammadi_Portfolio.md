# Ehsan Shahmohammadi
## Selected Professional Projects

---

### 1. MRI Radio Coil with Optical Transmission System
**Type / Context:** MS Thesis  
**Year:** 2024  

#### Project Overview
Traditionally, coaxial cables have been utilized in intravascular MRI coils for imaging blood vessels within the body. However, this project aims to mitigate the thermal effects caused by electrical current flow and enhance the signal-to-noise ratio (SNR) and Q-factor by employing optical fibers instead of coaxial cables. This approach involves transmitting information as light signals. Since the coil signal operates at a frequency of 63.875 MHz, and after exploring various methods for digital data transmission, a software-defined radio (SDR) was designed. This SDR allows the coil signal to be digitized and transmitted through an optical transmitter, facilitating the use of optical fibers for intravascular MRI coil applications.

#### System Architecture & Flow
- **RF Front-End:** RF Antenna / Intravascular Coil $\rightarrow$ Low-Noise Amplifier (LNA)
- **SDR (Software-Defined Radio):**
  - RF Tuner
  - Analog-to-Digital Converter (A/D CONV)
  - Digital Downconverter (DDC): Digital Mixer, Digital Local Oscillator, Low-Pass Filter
  - Digital Processor
- **Optical Link:**
  - Electrical to Optical (EO): Optical Transmitter with Laser Diode
  - Transmission Medium: Optical Fiber
  - Optical to Electrical (OE): Optical Receiver / Photodiode $\rightarrow$ Output Electrical Signal

#### Project Scope and Objectives
- **Hardware:**
  - Design Electronic Analog and Digital Circuits
  - Design PCB (Altium Designer)
  - Signal Integrity Analysis
  - Electromagnetic Theory and RF Engineering
  - Fiber Optic Device Integration
  - Digital Signal Processing & Medical Imaging
  - Embedded System Design
  - Board Assembly, Soldering, and Verification Testing
- **Software:**
  - C# Programming
  - Communication Protocols and Interfaces (USB)
  - Multithreading and Concurrency
  - Data Visualization
  - Debugging and Testing

---

### 2. NMS (Network Management Software)
**Company / Organization:** Danial Moj  
**Year:** 2019  

#### Project Overview
The project involved developing a mission-critical network management system (NMS) software specifically designed for optical telecommunications equipment.

The primary objectives of this project were to develop a modular, scalable, and high-performance NMS software capable of real-time monitoring and control of various optical network devices. A critical goal was designing a flexible .NET architecture that enabled easy integration of new equipment types through SNMP, while ensuring system stability, minimizing memory leaks, and enabling 24/7 runtime through extensive testing and optimizations. Implementing a distributed Docker and RabbitMQ architecture was crucial for responsiveness across thousands of connected devices. Essential network management capabilities, such as network topology views, fault and performance management, provisioning, and inventory management, were incorporated to provide comprehensive monitoring and control. Security features like SNMPv3 authentication were integrated to secure access and communication. Finally, the NMS software was integrated with databases and client software for centralized access, creating a robust platform that met all requirements for effectively managing the optical transport network infrastructure.

#### Key Features & Architecture
- **Network Element (NE) View & Subrack Management:** Real-time visual rack/slot state inspection (Transponder, Fan, Power, Control, Service modules).
- **Topology View:** Geographic and schematic optical network layout mapping.
- **Microservices & Messaging:** Dockerized services coordinated with RabbitMQ message broker.
- **Protocol Support:** SNMP (v1, v2c, v3 with encryption & auth).

#### Project Scope and Objectives
- Modular .NET Architecture
- Stability and Performance Optimization
- Distributed Architecture for Responsiveness
- Comprehensive Network Management Capabilities (Fault, Configuration, Accounting, Performance, Security - FCAPS)
- Security Integration (SNMPv3, Access Control)
- Integration with External Systems and Databases

---

### 3. Optical Transmitter System with WDM
**Company / Organization:** Danial Moj  
**Year:** 2017  

#### Project Overview
This project involved the design and development of an optical fiber transmitter device that leveraged modular architecture. The primary objective was to create a device capable of transmitting various services and protocols through Wavelength Division Multiplexing (WDM).

The device was designed with a modular approach, incorporating different cards from previous projects, including power, control, and service cards. This modular design facilitated flexibility and scalability, enabling easy integration of new components or functionalities.

The transmitter device featured transceiver cards equipped with SFP and XFP interfaces, enabling the transmission and reception of optical signals. The control and management of these transceiver cards were handled by a core board equipped with an embedded Linux system, providing a robust and efficient control platform.

The device's architecture was designed to support WDM multiplexing, allowing multiple wavelengths to be transmitted simultaneously over a single optical fiber. This feature enabled the transmission of various services and protocols, making the device compatible with OTN equipment and suitable for deployment in optical communication networks.

Through the integration of modular components, embedded systems, and advanced optical transmission technologies, this project aimed to create a flexible and scalable optical fiber transmitter device. The device's capabilities enabled the efficient transmission of diverse services and protocols, contributing to the advancement of optical communication networks and supporting the ever-increasing demand for high-speed data transmission.

#### Subsystems Designed
- **Backplane PCB:** Multi-slot high-speed backplane for interconnecting modular cards.
- **FAN Controls PCB:** Thermal monitoring and automated fan speed control circuitry.
- **SFP+ 10G Transponder Card PCB:** High-speed electro-optical transceiver cards supporting OTN/WDM.

#### Project Scope and Objectives
- Design Electronic and Optical Circuits
- Design PCB (Altium Designer)
- Embedded System Design
- Communication Protocols and Interfaces: USB, I2C, Ethernet (Web, SNMP, Socket), SPI, Serial
- Mechanical Enclosure & Thermal Design
- Optical Active and Passive Components Selection & Interfacing
- Embedded Linux OS Porting & Driver Development
- Debugging, Verification, and Testing

---

### 4. Design SFP 4.25G Optical Transceiver Module
**Company / Organization:** Danial Moj  
**Year:** 2015  

#### Project Overview
In this project, I led the design and development of a 4.25G optical fiber module, specifically a Small Form-factor Pluggable (SFP) module. The project involved creating detailed schematic diagrams and a 4-layer printed circuit board (PCB) layout using the industry-standard Altium Designer software.

Following the design phase, a prototype of the optical fiber module was manufactured and assembled. The prototype underwent rigorous electrical and optical testing to evaluate its functionality and performance, ensuring it met the required specifications.

While mass production of the module in Iran was deemed impractical due to the extensive manufacturing capabilities of Chinese factories in this domain, the project provided invaluable practical experience in the design and evaluation processes of optical fiber modules.

#### Key Integrated Components
- **ROSA (Receiver Optical Sub-Assembly):** Responsible for receiving and converting the optical signal into an electrical signal.
- **TOSA (Transmitter Optical Sub-Assembly):** Responsible for converting the electrical signal into an optical signal for transmission.
- **Limiting Amplifier:** A specialized amplifier circuit that amplifies the received electrical signal while limiting its amplitude within a specified range.
- **Laser Driver:** A circuit designed to drive and modulate the laser diode within the TOSA for high-speed optical signal transmission.

#### Project Scope and Objectives
- Design Analog/Digital Hardware and Optical Subsystems
- Design High-Density 4-Layer PCB (Altium Designer)
- High-Speed Signal Integrity & Impedance Matching
- Compact Mechanical Design conforming to SFP MSA standard
- Low-power, high-efficiency, thermal-aware design
- Comprehensive Electrical & Optical Testing and Debugging

---

### 5. Digital Motor Protection Relay (DMP-2)
**Company / Organization:** Mobtaker Sanat Pazhuh  
**Year:** 2013  

#### Project Overview
An advanced protection system was created for three-phase electric motors up to 440V and 1–600 kW. The microcontroller-based design monitors and protects against electrical and mechanical issues like overcurrent, phase loss, and overheating.

#### Key Features & Technical Highlights
- **Core Processing & Power Measurement:** Microchip PIC18F67K22 microcontroller and Analog Devices ADE7758 energy measurement IC for precision 3-phase power measurement.
- **True RMS Monitoring:** Real-time monitoring of current (True RMS), voltage, active/reactive power, and fault logging with clear LCD display.
- **Comprehensive Fault Protection:** Detects overload, startup overtime, current imbalance, stalled rotor, undercurrent, short circuit, phase failure, phase reversal, undervoltage, and overvoltage.
- **Intelligent Operation:** Smart trip zone configuration, customizable protection curves, and extensive event/fault logging.
- **Modular Multi-Board Architecture:**
  - CT (Current Transformer) Signal Conditioning PCB
  - Microcontroller & Signal Processing Mainboard PCB
  - Front Panel Human-Machine Interface (LCD & Keypad) PCB
  - Rugged DIN/Panel-mount industrial enclosure (Model: DMP-2)

#### Project Scope and Objectives
- Design Analog/Digital Hardware and Embedded Firmware
- Multi-board PCB Design (Altium Designer)
- Embedded System Design & Low-level Firmware
- Industrial Communication Protocols: I2C, SPI, RS-485 (Modbus)
- Mechanical and Enclosure Design
- Low-power, high-efficiency, compact form-factor
- Standard Compliance: NEMA and IEC-62053-22 electrical standards
- Debugging, Calibration, and Industrial EMC/Immunity Testing

---

### 6. Hardware & Software for Cellular Network Measurement and Optimization
**Context:** Kharazmi Festival Award Winner  
**Year:** 2012  

#### Project Overview
This project included two integrated parts: custom hardware and dedicated analytical software.

The hardware device measured cellular mobile network radio parameters at every location and transmitted them alongside GPS coordinates via a USB interface to a PC. The dedicated desktop application analyzed the stream, logged events, and rendered geographic/cellular data inside a GIS mapping environment for drive-test network optimization engineers. 

Due to its high level of innovation, efficiency, and formal approvals by prestigious telecommunication institutions, this project won a special honor at the Kharazmi Festival.

#### System Components
- **Drive-Test Hardware Unit:** Multi-band GSM/cellular engine, high-precision GPS receiver module, USB communication bridge, active antennas (RF/GPS), and power management board.
- **Desktop Software & Visualization Tool:**
  - Real-time logging of serving cell & neighboring channels (ARFCN, RSSI, RxLev, RxQual, BSIC, LAC, CI, MNC, MCC).
  - Synchronized GPS tracking (Speed, Altitude, Latitude, Longitude).
  - Operator recognition (e.g., Irancell MTN, MCI).
  - GIS-based mapping, trajectory tracing, and performance playback controls.

#### Project Scope and Objectives
- Design Electronic Analog and Digital Circuits
- Multi-layer RF/Digital PCB Design (Altium Designer)
- Embedded System Design & Firmware
- Develop C# Windows GUI Application
- Communication Protocols and Interfaces (USB Serial / CDC)
- Cellular Telecommunications Protocol & Radio Engineering Knowledge
- Data Visualization and GIS Integration
- Field Verification, Calibration, and Testing

---

### 7. City Bus Location Display System (Smart Public Transit)
**Client / Context:** Municipality of Tehran  
**Year:** 2012  

#### Project Overview
In 2012, I spearheaded the development of a pilot project for the first Public Intelligence Transportation System (PITC) in Tehran. This project faced numerous challenges, including the requirement to use solar power due to the lack of electrical grid infrastructure at bus stops and the need to implement an extremely cost-effective solution.

The hardware design was centered around a Microchip PIC18F microcontroller and a SIM800 GSM module. The design kept costs extremely low: bus-mounted transponder tags cost less than $30 each, while complete bus-station passenger display units (including solar panels, solar charge controllers, cellular modems, and outdoor LED displays) cost under $300.

Because commercial 3G networks had not yet launched in Iran at the time, the system utilized existing 2G GSM/GPRS data networks. Furthermore, before modern IoT ecosystems matured, an innovative hybrid architecture was developed: a Zigbee wireless mesh network (using Microchip MRF24J40 transceivers) coupled with cellular base stations estimated bus arrival times and proximity based on RF signal characteristics and station beacons, relaying live arrival schedules to station displays.

On the backend, multi-threaded high-concurrency socket server software was built using C# to communicate simultaneously with hundreds of remote station gateways and bus tags.

#### Subsystems Developed
- **Bus-Mounted Transponder Tag:** Low-cost, robust tracking and beacon unit.
- **Station Gateway PCB:** Solar-powered telemetry receiver and GSM uplink gateway.
- **Station Monitor PCB & Display:** Ultra-low-power outdoor indicator showing route status and arrival progress.
- **Central Telemetry Backend:** Multi-threaded C# TCP/IP socket server.

#### Project Scope and Objectives
- Design Electronic Analog and Digital Circuits
- Low-power Solar-compatible PCB Design (Altium Designer)
- Embedded Firmware Architecture
- Multi-threaded C# Socket Server and Management GUI
- Stability and Performance Optimization for 24/7 Unattended Operation
- Communication Interfaces: USB, Zigbee (IEEE 802.15.4), GSM/GPRS, Serial
- Cellular and RF Wireless Network Architecture
- Real-Time Data Visualization
- Field Deployment, Solar Power Budgeting, and Harsh Environment Testing
