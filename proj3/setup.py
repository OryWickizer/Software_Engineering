from setuptools import setup, find_packages

setup(
    name="tastebuddiez",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "docker>=6.0.0",
        "click>=8.0.0",
    ],
    entry_points={
        "console_scripts": [
            "tastebuddiez=tastebuddiez.cli:main",
        ],
    },
    package_data={
        "tastebuddiez": [
            "docker-compose.yml",
            "backend/**/*",
            "frontend/**/*",
        ],
    },
    author="Madison Book",
    description="TasteBuddiez - A meal sharing application",
    python_requires=">=3.8",
)
