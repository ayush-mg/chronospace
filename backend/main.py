import psycopg2
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
chronoscapeApp=FastAPI()
chronoscapeApp.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)
@chronoscapeApp.get("/")
def checkSystemStatus():
	return {"server":"running","database":"connected"}
@chronoscapeApp.get("/boundaries/{year}")
def getBoundariesByYear(year:int):
	try:
		dbConn=psycopg2.connect(dbname="postgres",user="postgres",password="prashnmark",host="localhost",port="5432")
		cursorObj=dbConn.cursor()
		sqlQuery="""
			SELECT regionName, ST_AsGeoJSON(geom) 
			FROM historicalBoundaries 
			WHERE %s >= startYear AND %s <= endYear;
		"""
		cursorObj.execute(sqlQuery,(year,year))
		records=cursorObj.fetchall()
		features=[]
		for row in records:
			regionname=row[0]
			geometryjson=json.loads(row[1])
			feature={
				"type":"Feature",
				"properties":{"name":regionname},
				"geometry":geometryjson
			}
			features.append(feature)
		cursorObj.close()
		dbConn.close()
		return {"type":"FeatureCollection","features":features}
	except Exception as err:
		return {"error":str(err)}