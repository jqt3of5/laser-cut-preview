FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 5000 
EXPOSE 5001 

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src

COPY ["Core.Data/Core.Data.csproj", "Core.Data/"]
RUN dotnet restore "Core.Data/Core.Data.csproj"

COPY ["ProjectAPI/ProjectAPI.csproj", "ProjectAPI/"]
RUN dotnet restore "ProjectAPI/ProjectAPI.csproj"

COPY . .
WORKDIR "/src/Core.Data"
RUN dotnet build "Core.Data.csproj" -c Release -o /app/build

WORKDIR "/src/ProjectAPI"
RUN dotnet build "ProjectAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ProjectAPI.csproj" -c Release -o /app/publish

FROM publish AS final
WORKDIR /app
RUN apt-get -f install libgdiplus
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ProjectAPI.dll"]
