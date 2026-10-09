# Heatzy Pilote

Control your **Heatzy Pilote** heating modules (and Acova Elec'Pro) from Gladys Assistant.

## Prerequisites

- A Heatzy account (the one you use in the Heatzy app).
- Your Pilote modules already paired and online in the Heatzy app.
- Internet access: Heatzy has no local API, so everything goes through the Heatzy cloud.

## Configuration

1. Install the integration from the Gladys catalog.
2. Open the **Configuration** tab and enter your Heatzy e-mail and password.
3. Optionally set the default duration of the holiday mode (days) and of the boost (minutes).
4. Open the **Discovery** tab, run a scan, then create the modules you want.

## What you get

| Module | Features |
| --- | --- |
| Pilote 1st generation | Mode: comfort, eco, frost protection, off |
| Pilote 2nd and 3rd generation | Mode, Override (none, holiday, boost), Lock, Weekly program |
| Pilote 4th generation (green connection light) | Same, plus Comfort -1 and Comfort -2 |

An override takes priority over everything else: holiday sets frost protection, boost sets comfort, until the duration ends.

## Good to know

- The state is refreshed every 60 seconds, so a change made on the module or in the Heatzy app appears in Gladys after up to a minute.
- Other Heatzy products (Pilote Pro, Glow, Shine, Onyx) are not supported yet and are ignored during the scan.

## Troubleshooting

- **Nothing found during the scan**: check your credentials, and that the modules appear online in the Heatzy app. The logs list every product found with its product key and generation.
- **Connection refused**: re-enter your password in the Configuration tab.
- **A command has no effect**: check that the module is online and not locked.
