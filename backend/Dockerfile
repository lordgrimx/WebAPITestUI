FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["WebTestUI.Backend.csproj", "."]
RUN dotnet restore "WebTestUI.Backend.csproj"
COPY . .
RUN dotnet publish "WebTestUI.Backend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
EXPOSE 443

# Ensure k6 is available (if needed)
RUN apt-get update && apt-get install -y gnupg2 && \
    apt-get install -y dirmngr --install-recommends && \
    gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69 && \
    echo "deb https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && \
    apt-get install -y k6

ENTRYPOINT ["dotnet", "WebTestUI.Backend.dll"]
