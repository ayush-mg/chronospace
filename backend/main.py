import psycopg2
import json
from fastapi import FastAPI

chronoscapeApp=FastAPI()

@chronoscapeApp.get("/")
def checkSystemStatus():
	return {"server":"running","database":"connected"}

@chronoscapeApp.get("/boundaries/{year}")
def getBoundariesByYear(year: int):
	try:
		dbConn=psycopg2.connect(dbname="postgres",user="postgres",password="prashnmark",host="localhost",port="5432")
		cursorObj=dbConn.cursor()
		
		# The mathematical query
		sqlQuery="""
			SELECT regionName, ST_AsGeoJSON(geom) 
			FROM historicalBoundaries 
			WHERE %s >= startYear AND %s <= endYear;
		"""
		cursorObj.execute(sqlQuery,(year,year))
		records=cursorObj.fetchall()
		
		# Package the raw data back into clean JSON format
		features=[]
		for row in records:
			region_name=row[0]
			geometry_json=json.loads(row[1])
			
			feature={
				"type":"Feature",
				"properties":{"name":region_name},
				"geometry":geometry_json
			}
			features.append(feature)
			
		cursorObj.close()
		dbConn.close()
		return {"type":"FeatureCollection","features":features}
		
	except Exception as err:
		return {"error":str(err)}