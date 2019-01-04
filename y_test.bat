@echo off

start cmd /c "parcel build html/energy_analyze/electric_structure.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/energy_analyze/electric_trend.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/energy_analyze/wastage_analyze.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/meters_manage/meters_manage.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/meters_manage/fault_meters.html --public-url ./ --no-source-maps -d test"
start cmd /c "parcel build html/meters_manage/online_manage.html --public-url ./ --no-source-maps -d test"

start cmd /c "parcel build html/system_manage.html --public-url ./ --no-source-maps -d test"

