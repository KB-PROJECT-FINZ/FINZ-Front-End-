package org.scoula.mocktrading.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.Map;

@Mapper
public interface StockMapper {

    /**
     * 종목 코드로 종목 정보 조회 (이미지 URL 포함)
     */
    @Select("SELECT code, name, image_url FROM stocks WHERE code = #{code}")
    Map<String, Object> getStockByCode(String code);

    /**
     * 모든 종목의 기본 정보 조회
     */
    @Select("SELECT code, name, image_url FROM stocks ORDER BY name")
    java.util.List<Map<String, Object>> getAllStocks();
}
