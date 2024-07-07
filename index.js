import AWS from 'aws-sdk';
import winston from 'winston';

const s3 = new AWS.S3();

// Configure winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

export const handler = async (event) => {
    logger.info(`Received event...`);

    if (!event.Records || !Array.isArray(event.Records) || event.Records.length === 0) {
        const errorMessage = 'Event structure is not as expected: missing Records array';
        logger.error(errorMessage);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: errorMessage
            })
        };
    }

    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    try {
        const params = {
            Bucket: bucketName,
            Key: objectKey
        };

        const metadata = await s3.headObject(params).promise();

        logger.info(`Metadata of the uploaded file ${objectKey}: ${JSON.stringify(metadata, null, 2)}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Metadata logged successfully for ${objectKey}`
            })
        };
    } catch (error) {
        logger.error(`Error getting metadata for ${objectKey} from ${bucketName}:`, error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error getting metadata for ${objectKey}`
            })
        };
    }
};
