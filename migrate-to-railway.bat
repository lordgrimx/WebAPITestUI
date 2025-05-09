@echo off
echo Railway'e migration yapiliyor...

set ASPNETCORE_ENVIRONMENT=Production
set UsePostgreSQL=true

cd backend
dotnet ef migrations add InitialMigration
dotnet ef database update

echo Migration tamamlandi!
pause 