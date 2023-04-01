export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
mvn clean -DskipTests install
cd music-web/
mvn jetty:run
cd ../