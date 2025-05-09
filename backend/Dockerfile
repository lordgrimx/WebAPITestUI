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

# Entity Framework Core araçlarını yükle
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# K6 ve gerekli bağımlılıkları yükle
RUN apt-get update && \
    apt-get install -y gnupg curl bash ca-certificates && \
    curl -s https://dl.k6.io/key.gpg | gpg --dearmor | tee /usr/share/keyrings/k6-archive-keyring.gpg > /dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && \
    apt-get install -y k6

# K6 konfigürasyonu
ENV K6_BROWSER_ENABLED=false
ENV K6_BROWSER_HEADLESS=true

# Çalışma modu ve yapılandırması
ENV ASPNETCORE_URLS=http://+:80;https://+:443
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "WebTestUI.Backend.dll"] 