#!/bin/bash

cd /home/indy/python
TEST_POOL_IP=10.0.0.2 python3 -m src.ogs
cd /home/indy/app
gunicorn -b 0.0.0.0:8888 main:app
