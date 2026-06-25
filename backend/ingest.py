import json
import psycopg2
def ingestGeojson(filePath):
	dbConn=psycopg2.connect(dbname="postgres",user="postgres",password="prashnmark",host="localhost",port="5432")
	cursorObj=dbConn.cursor()
	with open(filePath,'r')as dataFile:
		geoData=json.load(dataFile)
	for featureItem in geoData['features']:
		regionName=featureItem['properties'].get('name','Unknown')
		startYear=featureItem['properties'].get('startYear',0)
		endYear=featureItem['properties'].get('endYear',0)
		geometryData=json.dumps(featureItem['geometry'])
		cursorObj.execute("INSERT INTO historicalBoundaries(regionName,startYear,endYear,geom)VALUES(%s,%s,%s,ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(%s),4326)));",(regionName,startYear,endYear,geometryData))
	dbConn.commit()
	cursorObj.close()
	dbConn.close()
ingestGeojson("../data/sample.geojson")