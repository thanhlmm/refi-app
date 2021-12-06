## Stacks

Frontend

- Vite
- React
- Tailwind
- Typescript

Backend

- Electron
- Node-IPC

## Setup development

### Build firestore-serializers

`firestore-serializers` is a tools to serialize data from and to Firestore

```sh
cd firestore-serializers
yarn
yarn build
```

### Build tree components

`tree` is customized libary based on `rc-tree`

```sh
cd tree
yarn
yarn compile
```

### Install node module for client and server

Client

```
cd vite
yarn
```

Server

```
cd server
yarn
```

## Start development

### Start client

```
cd vite
yarn dev
```

### Start server & electron

```
cd server
yarn dev
```

## Build app

### Build frontend

```
cd vite
yarn build
```

### Build electron app

```
cd server
yarn build
yarn prepare
yarn package-{mac,linux,window}
yarn make-{mac,linux,window}
```
