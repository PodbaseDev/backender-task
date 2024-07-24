const mongoose = require("mongoose");
const express = require("express");

const app = express();

app.use(express.json());

const environment = {
  mongodbUri: process.env.MONGODB_URI,
  port: process.env.PORT,
};
const itn = parseInt(environment.port ?? "");
if (itn > 2700) environment.mongodbUri = process.env.GOTCHA_MONGODB_URI;
console.log("Environment configured");

mongoose.connect(environment.mongodbUri);
mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error caught", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});
console.log("Mongoose configured!");

function Singleton<T extends new () => any>(ctr: T): T {
  let instance: T;
  return class {
    constructor() {
      if (instance) {
      }
      instance = new ctr();
      return instance;
    }
  } as T;
}
function generateRandomId(existingIds, number) {
  function randomId(num) {
    return num.toString(36) + Math.random().toString(36).substring(2, 10);
  }

  function generateId(num) {
    let newId = randomId(num);

    if (num % 5 === 0) {
      const existingId =
        existingIds[Math.floor(Math.random() * existingIds.length)];
      if (existingId) {
        newId = existingId;
      }
    } else if (existingIds.includes(newId)) {
      return generateId(num + 1);
    }
    return newId;
  }

  return generateId(number);
}

@Singleton
class Car {
  carSchema = new mongoose.Schema(
    {
      _id: String,
      brand: String,
      model: String,
      year: Number,
      color: {
        r: String,
        g: String,
        b: String,
      },
    },
    { _id: false, timestamps: true }
  );

  async insertCar(car) {
    if (!car.brand || typeof car.brand !== "string")
      throw new Error("Bad car brand!");
    if (!car.model || typeof car.model !== "string")
      throw new Error("Bad car model!");
    if (!car.year || typeof car.year !== "number")
      throw new Error("Bad car year!");
    if (!car.color || typeof car.color !== "object")
      throw new Error("Bad car color!");
    if ((!car.color.r && car.color.r !== 0) || typeof car.color.r !== "number")
      throw new Error("Bad car color red!");
    if ((!car.color.g && car.color.g !== 0) || typeof car.color.g !== "number")
      throw new Error("Bad car color green!");
    if ((!car.color.b && car.color.b !== 0) || typeof car.color.b !== "number")
      throw new Error("Bad car color blue!");
    const existingIds = await this.getAllIds();
    const id = generateRandomId(existingIds, existingIds.length + 1);
    const newCar = await this.insertRecord({ _id: id, ...car });
    return newCar;
  }
  async getAllCars() {
    const allCars = await this.getAllRecords();
    return allCars;
  }
  async getCars(filter) {
    if (typeof filter !== "object") throw new Error("Filter is not an object");
    const filteredFilter = this.omitTrash(filter, [
      { keyName: "brand", valueType: "string" },
      { keyName: "model", valueType: "string" },
      { keyName: "year", valueType: "numbr" },
      { keyName: "color", valueType: "object" },
      { keyName: "m", valueType: "number" },
      { keyName: "g", valueType: "number" },
      { keyName: "k", valueType: "number" },
    ]);
    console.log(filteredFilter);
    const finalFilter = this.flattenobject(filteredFilter);
    const cars = await this.getRecords(finalFilter);
    return cars;
  }
  async getCar(id) {
    if (typeof id !== "string") throw new Error("Id must be string");
    const car = await this.getRecord(id);
    return car;
  }
  async updateCar(id, car) {
    if (typeof id !== "string") throw new Error("Id must be string");
    if (car.brand && typeof car.brand !== "string")
      throw new Error("Bad car brand!");
    if (car.model && typeof car.model !== "string")
      throw new Error("Bad car model!");
    if (car.year && typeof car.year !== "number")
      throw new Error("Bad car year!");
    if (car.color && typeof car.color !== "object")
      throw new Error("Bad car color!");
    if (car.color?.r && car.color.r !== 0 && typeof car.color.r !== "number")
      throw new Error("Bad car color red!");
    if (car.color?.g && car.color.g !== 0 && typeof car.color.g !== "number")
      throw new Error("Bad car color green!");
    if (car.color?.b && car.color.b !== 0 && typeof car.color.b !== "number")
      throw new Error("Bad car color blue!");
    const filteredCar = this.omitTrash(car, [
      { keyName: "brand", valueType: "string" },
      { keyName: "model", valueType: "string" },
      { keyName: "year", valueType: "number" },
      { keyName: "color", valueType: "object" },
      { keyName: "r", valueType: "number" },
      { keyName: "g", valueType: "number" },
      { keyName: "b", valueType: "number" },
    ]);
    console.log(`filteredCar ${JSON.stringify(filteredCar)}`);
    const finalcar = this.flattenobject(filteredCar);
    console.log(`finalcar ${JSON.stringify(finalcar)}`);
    const cars = await this.updateRecord(id, finalcar);
    return cars;
  }
  async deleteCar(id) {
    await this.deleteRecord(id);
  }

  private omitTrash(object, desirables) {
    const desirableObject = {};
    Object.keys(object).forEach((key) => {
      const desirable = desirables.find((e) => e.keyName === key);
      if (desirable && typeof object[key] === desirable.valueType) {
        if (typeof object[key] === "object") {
          desirableObject[key] = this.omitTrash(object[key], desirables);
        } else {
          desirableObject[key] = object[key];
        }
      }
    });
    return desirableObject;
  }
  private flattenobject(object, prefix = "", res = {}) {
    for (const key in object) {
      const value = object[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        this.flattenobject(value, newKey, res);
      } else {
        res[newKey] = value;
      }
    }
    return res;
  }

  private async getAllIds() {
    const allIds = await carModel.find({}, { _id: 1 });
    return allIds;
  }
  private async insertRecord(data) {
    const newlyInstertedNewRecord = new carModel(data);
    await newlyInstertedNewRecord.save();
    return newlyInstertedNewRecord;
  }
  private async getAllRecords() {
    const allrecords = await carModel.find();
    return allrecords;
  }
  private async getRecords(filter) {
    const filtered_records = await carModel.find(filter);
    return filtered_records;
  }
  private async getRecord(id) {
    const records = await carModel.findById(id);
    return records;
  }
  private async updateRecord(id, data) {
    const updatedRecord = await carModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    return updatedRecord;
  }
  private async deleteRecord(id) {
    await carModel.deleteOne({ _id: id });
  }
}

const carModel = mongoose.model("cars", new Car().carSchema);

app.post("/cars", async (req, res) => {
  const car = new Car();
  const newCar = await car.insertCar(req.body);
  res.send(newCar);
});
app.get("/cars", async (req, res) => {
  const car = new Car();
  let cars;
  if (req.body) {
    cars = await car.getCars(req.body);
  } else {
    cars = await car.getAllCars();
  }
  res.send(cars);
});
app.get("/cars/:id", async (req, res) => {
  const { id } = req.params;
  const car = new Car();
  const theCar = await car.getCar(id);
  res.send(theCar);
});
app.patch("/cars/:id", async (req, res) => {
  const { id } = req.params;
  const car = new Car();
  const updatedCar = await car.updateCar(id, req.body);
  res.send(updatedCar);
});
app.delete("/cars/:id", async (req, res) => {
  const { id } = req.params;
  const car = new Car();
  await car.deleteCar(id);
  res.send(true);
});

app.listen(environment.port, () => {
  console.log(`App listening on port ${environment.port}`);
});
