#!/bin/sh
export BASE_DEPLOY_PATH="/home/isng/apps/search-api"
export CODEDEPLOY_DEPLOY_PATH="$BASE_DEPLOY_PATH/...search-api"

export ISNG_DEPLOY_PATH="$BASE_DEPLOY_PATH/search-api$(date +-%Y%m%d%H%M%S)"
export ISNG_DEPLOY_PATH_SYMLINK="$BASE_DEPLOY_PATH/search-api"

cp -fr $CODEDEPLOY_DEPLOY_PATH $ISNG_DEPLOY_PATH
chown -R isng:isng $ISNG_DEPLOY_PATH
ln -sfT $ISNG_DEPLOY_PATH $ISNG_DEPLOY_PATH_SYMLINK
chown -R isng:isng $ISNG_DEPLOY_PATH_SYMLINK
sync

su isng -c "pm2 startOrGracefulReload $ISNG_DEPLOY_PATH_SYMLINK/ecosystem.json --env production"
su isng -c "pm2 save"

cp $ISNG_DEPLOY_PATH_SYMLINK/config/nginx/server.conf.dist $ISNG_DEPLOY_PATH_SYMLINK/config/nginx/server.conf
sed -i "s/<api\-name>/search-api/g" $ISNG_DEPLOY_PATH_SYMLINK/config/nginx/server.conf
sed -i "s/<port>/3002/g" $ISNG_DEPLOY_PATH_SYMLINK/config/nginx/server.conf
chmod 755 $ISNG_DEPLOY_PATH_SYMLINK/config/nginx/server.conf
/etc/init.d/nginx reload

cd /home/isng/scripts/next-aws-image-manager
su isng -c "venv/bin/python create_image.py"
su isng -c "venv/bin/python delete_snapshot.py"
