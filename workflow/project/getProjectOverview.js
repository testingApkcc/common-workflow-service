// projectoverview Dashboard API

exports.getProjectOverview = async (event, context, callback) => {
    const { Client } = require('pg');

    const client = new Client({
        host: "localhost",
        port: "5432",
        database: "postgres",
        user: "postgres",
        password: "postgres"
    });

    client.connect();

    let data = {};

    if (event.queryStringParameters) {
        data = event.queryStringParameters;
    }

    let objReturn = {
        code: 200,
        message: "project search successfully",
        type: "object",
        object: []
    };

    try {
        const result = await client.query(`
        SELECT
            project_table.id,
            usecase_table.usecase->>'status' as status
        FROM
            project_table
        JOIN
        usecase_table ON project_table.id = usecase_table.project_id
            WHERE project_table.id = $1 
            AND usecase_table.usecase->>'start_date' >= $2
            AND usecase_table.usecase->>'end_date' <= $3`, [data.id, data.from_date, data.to_date]
        );

        let incompleteCount = [];
        let completedCount = [];

        result.rows.forEach(row => {
            if (row.status === 'incomplete') {
                incompleteCount++;
            } else if (row.status === 'completed') {
                completedCount++;
            }
        });

        let returnObj = {
            incomplete_usecases: incompleteCount,
            completed_usecases: completedCount,
        };
        
        objReturn.object = returnObj;
        await client.end();

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": JSON.stringify(objReturn)
        };
    } catch (e) {
        objReturn.code = 400;
        objReturn.message = e.message || "An error occurred";
        client.end();

        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": JSON.stringify(objReturn)
        };
    }
};
