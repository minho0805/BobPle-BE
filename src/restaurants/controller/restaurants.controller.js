import {
  fetchRestaurantDetailRequestDto,
  fetchRestaurantsRequestDto,
} from "../dto/request/restaurants.request.dto.js";
import {
  fetchRestaurantDetail,
  fetchRestaurants,
} from "../service/restaurants.service.js";
import { StatusCodes } from "http-status-codes";

export const handleFetchRestaurants = async (req, res, next) => {
  /*
    #swagger.summary = "식당 정보 가져오기"
    #swagger.description = "식당 정보를 가져옵니다."
    #swagger.parameters['sponsoredOnly'] = {
      in: 'query',
      description: "제휴 매장만 표시 여부(1 : true, 0 : false)",
      required : false,
      example: 0,
    }
    #swagger.parameters['page'] = {
      in: 'query',
      description: "페이지 번호(기본 1 페이지)",
      required : false,
      example: 1,
    }
    #swagger.parameters['take'] = {
      in: 'query',
      description: "가져올 식당 갯수(기본 5개)",
      required : false,
      example: 5,
    }
  */
  const restaurants = await fetchRestaurants(
    fetchRestaurantsRequestDto(req.query),
  );
  res.status(StatusCodes.OK).success(restaurants);
};

export const handlefetchRestautantDetails = async (req, res, next) => {
  /*
    #swagger.summary = "특정 식당 정보 가져오기"
    #swagger.description = "지정한 식당의 세부정보를 가져옵니다."
    #swagger.parameters["restaurantId"] = {
      in:"path",
      description: "식당 ID",
      required: true,
      example: 1
    }
  */
  const restaurant = await fetchRestaurantDetail(
    fetchRestaurantDetailRequestDto(req.params),
  );
  res.status(StatusCodes.OK).success(restaurant);
};
