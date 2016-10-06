```json
GET /api/anim
{
  "status": "success"/"failure",
  "animations": [
    "anim1",
    "anim2",
    ...
  ]
}

GET /api/anim/:name   (e.g. /api/anim/anim2)
{
  "status": "success"/"failure",
  "anim2": [{
      "frameData": [{
          "room": 3,
          "color": "#572788",
          "fade": 0
      }, {
          "room": 4,
          "color": "#782782",
          "fade": 500
      }, ],
      "pause": 500
  }, {
      "frameData": [{
          "room": 5,
          "color": "#428489",
          "fade": 0
      }, {
          "room": 6,
          "color": "#786543",
          "fade": 500
      }, ],
      "pause": 500
  }, ],
}

POST /api/anim/:name
{
  "status": "success"/"failure"
}

DELETE /api/anim/:name
{
  "status": "success"/"failure"
}
```
