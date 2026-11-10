.PHONY: all data sql dashboard test
all: data sql dashboard test
data:
	python -m src.generate_data
sql:
	python -m src.run_analysis
dashboard:
	python -m src.build_dashboard_data
test:
	python -m unittest discover -s tests -v
