FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["llm-shop-backend.csproj", "./"]
RUN dotnet restore "llm-shop-backend.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "./llm-shop-backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./llm-shop-backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY firebase/yourchoicemarket-c63a3-firebase-adminsdk-fbsvc-f8a80b9478.json /app/firebase/yourchoicemarket-c63a3-firebase-adminsdk-fbsvc-f8a80b9478.json
ENTRYPOINT ["dotnet", "llm-shop-backend.dll"]
