@echo off

start cmd /c "parcel build html/electrical_data/electrical_data.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/electrical_data/electrical_anomaly.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/home_page.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/large_screen.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/log_management.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/login.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/unit_management.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/user_management.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/electrical_analysis/electric_quantity_analysis.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/electrical_analysis/electrical_consumption_composition.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/electrical_analysis/power_analysis.htmll --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/electrical_analysis/time_sharing_analysis.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/electricity_type.html --public-url ./ --no-source-maps -d test"
