if [ -z ${tag+x} ];
 then tag="latest";
fi
docker build -t configui:${tag} ../ -f ./Dockerfile
if [ -z ${deploy+x} ];
  then echo "no push";
else
  docker tag configui:${tag} localhost:5000/configui:${tag}
  docker push localhost:5000/configui:${tag}
fi