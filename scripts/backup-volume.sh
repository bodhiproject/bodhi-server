#!/bin/sh
# Copies the contents of a Docker volume to the destination path.

MESSAGE="$ ./backup-volume.sh docker-volume-name /path/to/backup/dir"
VOLUME_NAME=$1
DEST_PATH=$2

if [ -z "${VOLUME_NAME}" ]
then
    echo "docker volume name not defined"
    echo ${MESSAGE}
    exit 2
fi

if [ -z "${DEST_PATH}" ]
then
    echo "destination not defined"
    echo ${MESSAGE}
    exit 2
fi

echo "Backing up volume ${VOLUME_NAME}"
echo "Writing to ${DEST_PATH}"

# Get mountpoint path
docker volume inspect ${VOLUME_NAME} > volume.txt
MOUNTPOINT="$(jq -r '.[] | .Mountpoint' volume.txt)"
rm volume.txt

# Copy
sudo cp -r ${MOUNTPOINT} ${DEST_PATH}

echo "Finished backing up volume ${VOLUME_NAME}"
