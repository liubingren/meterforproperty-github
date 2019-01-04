@echo off

start cmd /c "parcel build html/recharge_Orders.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/abnormal_orders.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/classified_electricity/electricity_usage_types_comparison.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data_day.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data_month.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data_year.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/classified_electricity/realtime_electricity_data.html --public-url ./ --no-source-maps -d test"