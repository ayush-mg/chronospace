import psycopg2
from fastapi import FastAPI

chronoscapeApp=FastAPI()

@chronoscapeApp.get("/")
def checkSystemStatus():
	try:
		dbConn=psycopg2.connect(dbname="postgres",user="postgres",password="prashnmark",host="localhost",port="5432")
		dbConn.close()
		return {"server":"running","database":"connected"}
	except Exception as err:
		return {"server":"running","database":"failed","error":str(err)}