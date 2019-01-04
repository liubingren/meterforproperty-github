@echo off

start cmd /c "parcel build html/energy_analyze/electric_structure.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/energy_analyze/electric_trend.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/energy_analyze/wastage_analyze.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/meters_manage/meters_manage.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/meters_manage/fault_meters.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/meters_manage/online_manage.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/system_manage.html --public-url ./ --no-source-maps -d test"


start cmd /c "parcel build html/recharge_Orders.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/abnormal_orders.html --public-url ./ --no-source-maps -d test"


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
start cmd /c "parcel build html/electrical_analysis/power_analysis.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/electrical_analysis/time_sharing_analysis.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/classified_electricity/electricity_usage_types_comparison.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data_day.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data_month.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data_year.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/electricity_type.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/peakvalleyScheme/peakvalleySchemeList.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/peakvalleyScheme/peakvalleySchemeDetail.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/anomaly_electrical.html --public-url ./ --no-source-maps -d test"