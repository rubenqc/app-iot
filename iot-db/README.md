# iot-db

## Usage

``` js
const setupDatabase = require('iot-db')

setupDabase(config).then(db => {
    const { Agent, Metric} = db

}).catch(err => console.error(err))
```
