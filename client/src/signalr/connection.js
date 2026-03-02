import * as signalR from "@microsoft/signalr";

export let createConnection = () =>
  new signalR.HubConnectionBuilder()
    .withUrl("http://192.168.1.35:5005/hub/game")
    // .withUrl('http://192.168.1.57:5005/hub/game')
    .withAutomaticReconnect()
    .build();
