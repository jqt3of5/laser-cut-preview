FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80 
EXPOSE 443 

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "LaserPreview.sln"
RUN dotnet build

FROM build AS publish
RUN dotnet publish "LaserPreview.sln" -c Release -o /app/publish

FROM publish AS final
WORKDIR /app
RUN apt-get -f install libgdiplus
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ProjectAPI.dll"]
