package utils

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	URL "net/url"
	"strings"
)

type ApiJson struct{
	Code int `json:"code"`
	Msg string `json:"msg"`
	Data interface{} `json:"data"`
}

// Get
/**
 * 发送GET请求
 * url:请求地址
 * query:请求参数
 * result:返回结果, err:错误信息
 */
func Get(url string, config ...map[string]string) (result ApiJson, err error) {

	var data ApiJson

	data.Code = 500
	data.Msg  = "服务器错误"
	data.Data = nil

	query := URL.Values{}

	for key, val := range config[0] {
		query.Add(key,val)
	}

	// 转义URL参数
	params := query.Encode()

	if _, empty := TypeOf(params); !empty {
		params = "?" + params
	}

	client := &http.Client{}
	reqest, _ := http.NewRequest("GET", url + params, nil)

	// 添加头信息
	for key, val := range config[1] {
		reqest.Header.Set(key, val)
	}

	// 设置默认的 Content-Type
	if yes := InMapKey("Content-Type", config[1]); !yes {
		reqest.Header.Set("Content-Type", "application/json")
	}

	response, err := client.Do(reqest)
	if err != nil {
		data.Code = 500
		return data, err
	}
	if response.StatusCode == 200 {
		body, err_ := ioutil.ReadAll(response.Body)
		if err_ != nil {
			data.Code = 500
			return data, err_
		}
		_ = json.Unmarshal(body, &data)
		return data, nil
	}
	return data, err
}

func Request(url string, method string, data any) (result any, err error) {

	client := &http.Client{}
	jsonData, _ := json.Marshal(data)
	reqest  , _ := http.NewRequest(method, url, strings.NewReader(string(jsonData)))

	reqest.Header.Set("Content-Type", "application/json")

	response, err := client.Do(reqest)
	if err != nil {
		return "", err
	}
	if response.StatusCode == 200 {
		body, err_ := ioutil.ReadAll(response.Body)
		if err_ != nil {
			return "", err_
		}
		return Json(string(body)), nil
	}
	return "", err
}

// Json
// 格式化JSON数据
func Json(data string) interface{} {
	var result map[string]interface{}
	json.Unmarshal([]byte(data), &result)
	return result
}
