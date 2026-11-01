// src/data/hrSeed.js
/**
 * Realistic HR & Incentives seed data matching the reference screenshot:
 * 28 Active Staff, 96.2% Average Target Achievement, ₹3.84 Lakhs Incentive Pool, 98.1% Avg Attendance.
 * Incentive Pool distribution: Sales ₹1.82L (47%), Service ₹1.15L (30%), Bonus ₹0.87L (23%).
 */

export const SEEDED_HR_STAFF = [
  {
    "id": "staff-001",
    "userId": "usr-deepak-rao",
    "employeeCode": "EMP-0104",
    "name": "Deepak Rao",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-02-15",
    "attendanceDays": 24,
    "workingDays": 26,
    "targetQuota": 12,
    "achieved": 10,
    "baseSalary": 28000,
    "baselineSalesIncentive": 18500,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 4412",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 97,
    "displayScore": 96,
    "displayTopPayout": 46500,
    "events": [
      {
        "id": "ev-1",
        "type": "vehicle_delivered",
        "referenceId": "SO-2627-010",
        "date": "2026-10-04",
        "quantity": 1,
        "value": 145000,
        "commission": 1500,
        "label": "Hunter 350 Delivery"
      },
      {
        "id": "ev-2",
        "type": "vehicle_delivered",
        "referenceId": "SO-2627-014",
        "date": "2026-10-08",
        "quantity": 1,
        "value": 215000,
        "commission": 2000,
        "label": "Dominar 400 Delivery"
      },
      {
        "id": "ev-3",
        "type": "vehicle_delivered",
        "referenceId": "SO-2627-019",
        "date": "2026-10-12",
        "quantity": 1,
        "value": 185000,
        "commission": 1500,
        "label": "Classic 350 Stealth Black"
      },
      {
        "id": "ev-4",
        "type": "accessory_sale",
        "referenceId": "INV-2627-022",
        "date": "2026-10-15",
        "value": 35000,
        "commission": 1750,
        "label": "Touring Accessories Attach"
      },
      {
        "id": "ev-5",
        "type": "finance_insurance_attach",
        "referenceId": "INV-2627-023",
        "date": "2026-10-18",
        "value": 85000,
        "commission": 1000,
        "label": "Bajaj Finance + ICICI Lombard Insurance Attach"
      },
      {
        "id": "ev-6",
        "type": "slab_bonus",
        "referenceId": "Q-OCT-26",
        "date": "2026-10-28",
        "quantity": 7,
        "value": 1100000,
        "commission": 10750,
        "label": "Monthly Milestone Volume Slab Achievement"
      }
    ]
  },
  {
    "id": "staff-002",
    "userId": "usr-vikram-sethi",
    "employeeCode": "EMP-0102",
    "name": "Vikram Sethi",
    "role": "Sales Manager",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-06-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 30,
    "achieved": 28,
    "baseSalary": 55000,
    "baselineSalesIncentive": 42000,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 8821",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 96,
    "displayScore": 95,
    "displayTopPayout": 42000,
    "events": [
      {
        "id": "ev-11",
        "type": "team_delivery_quota",
        "referenceId": "TEAM-OCT-26",
        "date": "2026-10-28",
        "quantity": 28,
        "value": 39500000,
        "commission": 35000,
        "label": "Team Monthly Deliveries (28 Bikes)"
      },
      {
        "id": "ev-12",
        "type": "finance_penetration_bonus",
        "referenceId": "FIN-OCT-26",
        "date": "2026-10-29",
        "value": 2500000,
        "commission": 7000,
        "label": "Showroom 85% Finance Penetration Gatekeeper Bonus"
      }
    ]
  },
  {
    "id": "staff-003",
    "userId": "usr-manoj-kumar",
    "employeeCode": "EMP-0106",
    "name": "Manoj Kumar",
    "role": "Technician",
    "department": "Workshop",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-11-10",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 60,
    "achieved": 68,
    "baseSalary": 25000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 21500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1920",
    "status": "Pending",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "displayScore": 94,
    "displayTopPayout": 38200,
    "events": [
      {
        "id": "ev-21",
        "type": "job_completed",
        "referenceId": "JC20261005-014",
        "date": "2026-10-05",
        "quantity": 24,
        "commission": 7200,
        "label": "24 Periodic Maintenance Jobs"
      },
      {
        "id": "ev-22",
        "type": "job_completed",
        "referenceId": "JC20261011-020",
        "date": "2026-10-11",
        "quantity": 20,
        "commission": 12000,
        "label": "20 Major Engine/Chassis Repairs"
      },
      {
        "id": "ev-23",
        "type": "first_time_fix_stat",
        "date": "2026-10-30",
        "rate": 96,
        "commission": 2300,
        "label": "96% First Time Fix (FTF) Benchmark Bonus"
      }
    ]
  },
  {
    "id": "staff-004",
    "userId": "usr-ananya-sharma",
    "employeeCode": "EMP-0105",
    "name": "Ananya Sharma",
    "role": "Service Advisor",
    "department": "Service",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-01-20",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 120,
    "achieved": 115,
    "baseSalary": 32000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 16500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 6634",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-31",
        "type": "service_booked",
        "referenceId": "SRV-OCT-115",
        "date": "2026-10-25",
        "quantity": 115,
        "commission": 11500,
        "label": "115 Service Job Cards Billed"
      },
      {
        "id": "ev-32",
        "type": "value_added_services",
        "referenceId": "VAS-OCT-26",
        "date": "2026-10-28",
        "value": 85000,
        "commission": 5000,
        "label": "Teflon Coating & RSA Upsell Attach"
      }
    ]
  },
  {
    "id": "staff-005",
    "userId": "usr-sales-0",
    "employeeCode": "EMP-0110",
    "name": "Anand Kumar",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-03-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 12,
    "achieved": 10,
    "baseSalary": 28000,
    "baselineSalesIncentive": 18000,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 7712",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-s-0",
        "type": "vehicle_delivered",
        "date": "2026-10-20",
        "quantity": 10,
        "commission": 18000,
        "label": "10 Units Delivered in Month"
      }
    ]
  },
  {
    "id": "staff-006",
    "userId": "usr-sales-1",
    "employeeCode": "EMP-0111",
    "name": "Priya Sundaram",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-03-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 12,
    "achieved": 12,
    "baseSalary": 28000,
    "baselineSalesIncentive": 21000,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 7712",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-s-1",
        "type": "vehicle_delivered",
        "date": "2026-10-20",
        "quantity": 12,
        "commission": 21000,
        "label": "12 Units Delivered in Month"
      }
    ]
  },
  {
    "id": "staff-007",
    "userId": "usr-sales-2",
    "employeeCode": "EMP-0112",
    "name": "Rohit Chandran",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-03-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 10,
    "achieved": 9,
    "baseSalary": 26000,
    "baselineSalesIncentive": 15000,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 7712",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-s-2",
        "type": "vehicle_delivered",
        "date": "2026-10-20",
        "quantity": 9,
        "commission": 15000,
        "label": "9 Units Delivered in Month"
      }
    ]
  },
  {
    "id": "staff-008",
    "userId": "usr-sales-3",
    "employeeCode": "EMP-0113",
    "name": "Sandeep Yadav",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-03-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 10,
    "achieved": 10,
    "baseSalary": 26000,
    "baselineSalesIncentive": 18000,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 7712",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-s-3",
        "type": "vehicle_delivered",
        "date": "2026-10-20",
        "quantity": 10,
        "commission": 18000,
        "label": "10 Units Delivered in Month"
      }
    ]
  },
  {
    "id": "staff-009",
    "userId": "usr-sales-4",
    "employeeCode": "EMP-0114",
    "name": "Divya Murthy",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-03-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 8,
    "achieved": 8,
    "baseSalary": 24000,
    "baselineSalesIncentive": 11500,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 7712",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-s-4",
        "type": "vehicle_delivered",
        "date": "2026-10-20",
        "quantity": 8,
        "commission": 11500,
        "label": "8 Units Delivered in Month"
      }
    ]
  },
  {
    "id": "staff-0010",
    "userId": "usr-sales-5",
    "employeeCode": "EMP-0115",
    "name": "Arun Balaji",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-03-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 14,
    "achieved": 14,
    "baseSalary": 30000,
    "baselineSalesIncentive": 23000,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 7712",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-s-5",
        "type": "vehicle_delivered",
        "date": "2026-10-20",
        "quantity": 14,
        "commission": 23000,
        "label": "14 Units Delivered in Month"
      }
    ]
  },
  {
    "id": "staff-0011",
    "userId": "usr-sales-6",
    "employeeCode": "EMP-0116",
    "name": "Chetan Gowda",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2024-03-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 15,
    "achieved": 15,
    "baseSalary": 30000,
    "baselineSalesIncentive": 15000,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 7712",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-s-6",
        "type": "vehicle_delivered",
        "date": "2026-10-20",
        "quantity": 15,
        "commission": 15000,
        "label": "15 Units Delivered in Month"
      }
    ]
  },
  {
    "id": "staff-012",
    "userId": "usr-serv-0",
    "employeeCode": "EMP-0120",
    "name": "Ramesh Babu",
    "role": "Technician",
    "department": "Workshop",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-10-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 55,
    "achieved": 53,
    "baseSalary": 24000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 15500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 3320",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-srv-0",
        "type": "job_completed",
        "date": "2026-10-22",
        "quantity": 53,
        "commission": 15500,
        "label": "53 Service Benchmarks Achieved"
      }
    ]
  },
  {
    "id": "staff-013",
    "userId": "usr-serv-1",
    "employeeCode": "EMP-0121",
    "name": "Venkatesh Prasad",
    "role": "Technician",
    "department": "Workshop",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-10-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 50,
    "achieved": 49,
    "baseSalary": 26000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 14500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 3320",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-srv-1",
        "type": "job_completed",
        "date": "2026-10-22",
        "quantity": 49,
        "commission": 14500,
        "label": "49 Service Benchmarks Achieved"
      }
    ]
  },
  {
    "id": "staff-014",
    "userId": "usr-serv-2",
    "employeeCode": "EMP-0122",
    "name": "Naveen Kumar",
    "role": "Technician",
    "department": "Workshop",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-10-01",
    "attendanceDays": 25,
    "workingDays": 26,
    "targetQuota": 50,
    "achieved": 47,
    "baseSalary": 23000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 11000,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 3320",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-srv-2",
        "type": "job_completed",
        "date": "2026-10-22",
        "quantity": 47,
        "commission": 11000,
        "label": "47 Service Benchmarks Achieved"
      }
    ]
  },
  {
    "id": "staff-015",
    "userId": "usr-serv-3",
    "employeeCode": "EMP-0123",
    "name": "Kiran Swamy",
    "role": "Technician",
    "department": "Workshop",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-10-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 45,
    "achieved": 43,
    "baseSalary": 22000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 9500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 3320",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-srv-3",
        "type": "job_completed",
        "date": "2026-10-22",
        "quantity": 43,
        "commission": 9500,
        "label": "43 Service Benchmarks Achieved"
      }
    ]
  },
  {
    "id": "staff-016",
    "userId": "usr-serv-4",
    "employeeCode": "EMP-0124",
    "name": "Praveen Reddy",
    "role": "Service Advisor",
    "department": "Service",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-10-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 100,
    "achieved": 97,
    "baseSalary": 30000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 13500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 3320",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-srv-4",
        "type": "job_completed",
        "date": "2026-10-22",
        "quantity": 97,
        "commission": 13500,
        "label": "97 Service Benchmarks Achieved"
      }
    ]
  },
  {
    "id": "staff-017",
    "userId": "usr-serv-5",
    "employeeCode": "EMP-0125",
    "name": "Sunil Shetty",
    "role": "Parts Specialist",
    "department": "Parts & Spares",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-10-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 30,
    "achieved": 29,
    "baseSalary": 23000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 6500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 3320",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-srv-5",
        "type": "job_completed",
        "date": "2026-10-22",
        "quantity": 29,
        "commission": 6500,
        "label": "29 Service Benchmarks Achieved"
      }
    ]
  },
  {
    "id": "staff-018",
    "userId": "usr-serv-6",
    "employeeCode": "EMP-0126",
    "name": "Madhavan Pillai",
    "role": "Quality Inspector",
    "department": "Workshop",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-10-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 80,
    "achieved": 77,
    "baseSalary": 28000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 6500,
    "baselinePerformanceBonus": 0,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 3320",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 94,
    "events": [
      {
        "id": "ev-srv-6",
        "type": "job_completed",
        "date": "2026-10-22",
        "quantity": 77,
        "commission": 6500,
        "label": "77 Service Benchmarks Achieved"
      }
    ]
  },
  {
    "id": "staff-019",
    "userId": "usr-mgmt-0",
    "employeeCode": "EMP-0130",
    "name": "Rajesh Varma",
    "role": "Super Admin",
    "department": "Management",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 100,
    "achieved": 99,
    "baseSalary": 120000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 12000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-0",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 12000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-020",
    "userId": "usr-mgmt-1",
    "employeeCode": "EMP-0131",
    "name": "Karthik Raja",
    "role": "Service Manager",
    "department": "Service",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 250,
    "achieved": 243,
    "baseSalary": 52000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 10000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-1",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 10000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-021",
    "userId": "usr-mgmt-2",
    "employeeCode": "EMP-0132",
    "name": "Suresh Iyer",
    "role": "Accountant",
    "department": "Accounts",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 100,
    "achieved": 97,
    "baseSalary": 42000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 10000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-2",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 10000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-022",
    "userId": "usr-mgmt-3",
    "employeeCode": "EMP-0133",
    "name": "Girish Patil",
    "role": "Inventory Manager",
    "department": "Parts & Spares",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 50,
    "achieved": 49,
    "baseSalary": 38000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 10000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-3",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 10000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-023",
    "userId": "usr-mgmt-4",
    "employeeCode": "EMP-0134",
    "name": "Shalini Nair",
    "role": "CRM Executive",
    "department": "Customer Care",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 80,
    "achieved": 77,
    "baseSalary": 25000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 9000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-4",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 9000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-024",
    "userId": "usr-mgmt-5",
    "employeeCode": "EMP-0135",
    "name": "Harish Gowda",
    "role": "PDI Specialist",
    "department": "Operations",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 40,
    "achieved": 39,
    "baseSalary": 24000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 8000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-5",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 8000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-025",
    "userId": "usr-mgmt-6",
    "employeeCode": "EMP-0136",
    "name": "Kavita Mohan",
    "role": "Accountant",
    "department": "Accounts",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 100,
    "achieved": 97,
    "baseSalary": 28000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 8000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-6",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 8000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-026",
    "userId": "usr-mgmt-7",
    "employeeCode": "EMP-0137",
    "name": "Ayesha Khan",
    "role": "CRM Executive",
    "department": "Customer Care",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 70,
    "achieved": 67,
    "baseSalary": 27000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 7000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-7",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 7000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-027",
    "userId": "usr-mgmt-8",
    "employeeCode": "EMP-0138",
    "name": "Manjunath K.",
    "role": "Test Ride Lead",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 60,
    "achieved": 58,
    "baseSalary": 22000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 7000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Paid",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-8",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 7000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  },
  {
    "id": "staff-028",
    "userId": "usr-mgmt-9",
    "employeeCode": "EMP-0139",
    "name": "Varun Teja",
    "role": "Sales Executive",
    "department": "Sales",
    "branch": "Bangalore Central Flagship",
    "branchId": "br-blr-central",
    "joiningDate": "2023-01-01",
    "attendanceDays": 26,
    "workingDays": 26,
    "targetQuota": 8,
    "achieved": 7,
    "baseSalary": 22000,
    "baselineSalesIncentive": 0,
    "baselineServiceIncentive": 0,
    "baselinePerformanceBonus": 6000,
    "baselineOemIncentive": 0,
    "approvedAdjustments": 0,
    "bankMasked": "•••• 1101",
    "status": "Disputed",
    "employmentStatus": "ACTIVE",
    "qualityScore": 95,
    "events": [
      {
        "id": "ev-b-9",
        "type": "management_kpi",
        "date": "2026-10-25",
        "quantity": 1,
        "commission": 6000,
        "label": "Department Operational KPI Bonus"
      }
    ]
  }
];

export const SEEDED_PERFORMANCE_TREND = [
  { month: 'May', attendance: 90.0, achievement: 78.0, pool: 285000 },
  { month: 'Jun', attendance: 92.0, achievement: 82.5, pool: 310000 },
  { month: 'Jul', attendance: 94.0, achievement: 88.0, pool: 335000 },
  { month: 'Aug', attendance: 96.0, achievement: 91.5, pool: 350000 },
  { month: 'Sep', attendance: 97.2, achievement: 94.0, pool: 365000 },
  { month: 'Oct', attendance: 98.1, achievement: 96.2, pool: 384000 },
];

export const SEEDED_PAYROLL_RUNS = [
  {
    id: 'payrun-2026-10',
    month: '2026-10',
    monthLabel: 'October 2026',
    branch: 'Bangalore Central Flagship',
    branchId: 'br-blr-central',
    staffCount: 28,
    totalBaseSalary: 908000,
    totalIncentives: 384000,
    totalNetPayout: 1292000,
    status: 'Under Review', // Draft | Calculated | Under Review | Approved | Paid
    calculatedAt: '2026-10-30T10:00:00Z',
    submittedBy: 'Suresh Iyer (Accountant)',
    reviewedBy: null,
    paidAt: null,
    bankRef: null,
    notes: 'October 2026 payroll run ready for dual-control approval.',
  },
  {
    id: 'payrun-2026-09',
    month: '2026-09',
    monthLabel: 'September 2026',
    branch: 'Bangalore Central Flagship',
    branchId: 'br-blr-central',
    staffCount: 28,
    totalBaseSalary: 895000,
    totalIncentives: 355500,
    totalNetPayout: 1250500,
    status: 'Paid',
    calculatedAt: '2026-09-30T09:30:00Z',
    submittedBy: 'Suresh Iyer (Accountant)',
    reviewedBy: 'Rajesh Varma (Super Admin)',
    paidAt: '2026-10-02T11:45:00Z',
    bankRef: 'HDFC-NEFT-992019482',
    notes: 'Disbursed via HDFC Corporate NetBanking Batch.',
  },
  {
    id: 'payrun-2026-08',
    month: '2026-08',
    monthLabel: 'August 2026',
    branch: 'Bangalore Central Flagship',
    branchId: 'br-blr-central',
    staffCount: 27,
    totalBaseSalary: 860000,
    totalIncentives: 340000,
    totalNetPayout: 1200000,
    status: 'Paid',
    calculatedAt: '2026-08-31T09:00:00Z',
    submittedBy: 'Suresh Iyer (Accountant)',
    reviewedBy: 'Rajesh Varma (Super Admin)',
    paidAt: '2026-09-02T14:15:00Z',
    bankRef: 'HDFC-NEFT-883190214',
    notes: 'Disbursed on time without disputes.',
  },
];

export const SEEDED_INCENTIVE_RULES = [
  {
    id: 'rule-sales-slabs',
    category: 'Sales',
    name: 'Vehicle Delivery Volume Slabs',
    description: 'Tiered incentive per 2-wheeler retail delivery based on volume targets.',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    version: 'v2.1',
    tiers: [
      { minUnits: 1, maxUnits: 8, amountPerUnit: 1000 },
      { minUnits: 9, maxUnits: 12, amountPerUnit: 1500 },
      { minUnits: 13, maxUnits: 999, amountPerUnit: 2000 },
    ],
  },
  {
    id: 'rule-sales-attach',
    category: 'Sales',
    name: 'Accessories & VAS Attach Commission',
    description: 'Attach bonus on official accessories, helmets, and extended warranty.',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    version: 'v1.4',
    accessoryPercent: 5.0,
    financeCommissionPerApprovedCase: 500,
    insuranceCommissionPerCase: 500,
  },
  {
    id: 'rule-service-productivity',
    category: 'Service',
    name: 'Technician Labor & FTF Benchmark',
    description: 'Flat rate per periodic maintenance, repair job points, and First Time Fix quality bonus.',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    version: 'v3.0',
    periodicServiceRate: 300,
    majorRepairRate: 600,
    firstTimeFixBonusThreshold: 95,
    firstTimeFixBonusAmount: 2000,
    comebackDeduction: 1000,
  },
  {
    id: 'rule-management-gatekeeper',
    category: 'Management',
    name: 'Branch Performance Gatekeeper Bonus',
    description: 'Supervisory bonus for achieving >95% branch volume and SLA targets.',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    version: 'v2.0',
    bonusSlabs: [
      { minAchievement: 90, maxAchievement: 94, bonus: 5000 },
      { minAchievement: 95, maxAchievement: 100, bonus: 10000 },
      { minAchievement: 101, maxAchievement: 200, bonus: 12000 },
    ],
  },
];

export const SEEDED_MONTHLY_ATTENDANCE = {
  "staff-001": {
    "staffId": "staff-001",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "A",
        "label": "Absent",
        "reason": "Unplanned absence",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 24,
      "absent": 2,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-002": {
    "staffId": "staff-002",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-003": {
    "staffId": "staff-003",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-004": {
    "staffId": "staff-004",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-005": {
    "staffId": "staff-005",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-006": {
    "staffId": "staff-006",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-007": {
    "staffId": "staff-007",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-008": {
    "staffId": "staff-008",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-009": {
    "staffId": "staff-009",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-0010": {
    "staffId": "staff-0010",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-0011": {
    "staffId": "staff-0011",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-012": {
    "staffId": "staff-012",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-013": {
    "staffId": "staff-013",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-014": {
    "staffId": "staff-014",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 25,
      "absent": 1,
      "leaves": 1,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-015": {
    "staffId": "staff-015",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-016": {
    "staffId": "staff-016",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-017": {
    "staffId": "staff-017",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-018": {
    "staffId": "staff-018",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-019": {
    "staffId": "staff-019",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-020": {
    "staffId": "staff-020",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-021": {
    "staffId": "staff-021",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-022": {
    "staffId": "staff-022",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-023": {
    "staffId": "staff-023",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-024": {
    "staffId": "staff-024",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-025": {
    "staffId": "staff-025",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-026": {
    "staffId": "staff-026",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-027": {
    "staffId": "staff-027",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  },
  "staff-028": {
    "staffId": "staff-028",
    "month": "2026-10",
    "days": {
      "1": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-01"
      },
      "2": {
        "status": "H",
        "label": "Gandhi Jayanti",
        "date": "2026-10-02"
      },
      "3": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-03"
      },
      "4": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-04"
      },
      "5": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-05"
      },
      "6": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-06"
      },
      "7": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-07"
      },
      "8": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-08"
      },
      "9": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-09"
      },
      "10": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-10"
      },
      "11": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-11"
      },
      "12": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-12"
      },
      "13": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-13"
      },
      "14": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-14"
      },
      "15": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-15"
      },
      "16": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-16"
      },
      "17": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-17"
      },
      "18": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-18"
      },
      "19": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-19"
      },
      "20": {
        "status": "H",
        "label": "Vijayadashami / Dussehra",
        "date": "2026-10-20"
      },
      "21": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-21"
      },
      "22": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-22"
      },
      "23": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-23"
      },
      "24": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-24"
      },
      "25": {
        "status": "W",
        "label": "Weekly Off",
        "date": "2026-10-25"
      },
      "26": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-26"
      },
      "27": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-27"
      },
      "28": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-28"
      },
      "29": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-29"
      },
      "30": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-30"
      },
      "31": {
        "status": "P",
        "label": "Present",
        "checkIn": "09:00",
        "checkOut": "18:30",
        "date": "2026-10-31"
      }
    },
    "summary": {
      "present": 26,
      "absent": 0,
      "leaves": 0,
      "holidays": 2,
      "weeklyOffs": 4
    }
  }
};
