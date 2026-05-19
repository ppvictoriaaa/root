export interface WeatherForecastDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
}

export interface WeatherForecast {
  days: WeatherForecastDay[];
}
