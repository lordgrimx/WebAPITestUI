FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["WebTestUI.Backend.csproj", "./"]
RUN dotnet restore "WebTestUI.Backend.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "WebTestUI.Backend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WebTestUI.Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebTestUI.Backend.dll"] 