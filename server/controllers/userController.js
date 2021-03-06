const userModel = require('../models/userModel');
const util = require('../util');
const exportConfig = require('../../config/exportConfig');
const sendEmail = require('../mail')
const sendSMS = require('../sms')
const phoneCode = require('../phonecode');
/**
 * 管理员登录
 * @param {*} ctx
 * @param {*} next
 */
exports.loginIn = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let username = body.username;
        let password = body.password;
        let loginRescheck = await userModel.loginIncheck(username);
        if (loginRescheck.length) {
            let loginRes = await userModel.loginIn(username, password);
            if (loginRes != null) {
                exportConfig(ctx, 'login', loginRes);
            } else {
                exportConfig(ctx, 'passwordError', loginRes);
            }   
        } else {
            exportConfig(ctx, 'noUser', loginRescheck);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
};
exports.loginOut = async (ctx, next) => {
    try {
        let data = {};
        exportConfig(ctx, 'logout', data);
        return next;
    } catch (error) {
        console.log(error);
    }
}
/**
 * 返回所有管理员userName
 * @param {*} ctx
 * @param {*} next
 */
exports.queryUserName = async (ctx, next ) => {
    try {
        let User = await userModel.queryUserName();
        if (User.length) {
            exportConfig(ctx, 'queryUserSuccess', User);
        } else {
            exportConfig(ctx, 'queryUserError', User);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
};

/**
 * 查询管理员
 * @param {*} ctx
 * @param {*} next
 */
exports.queryAllUser = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let userInfo = await userModel.queryAllUser(body);
        let user = {
            docs: userInfo.docs,
            pagination: {
                total: userInfo.total,
                pageSize: userInfo.limit,
                current: userInfo.page,
            },
        };
        if (userInfo.total) {
            exportConfig(ctx, 'queryUserSuccess', user);
        } else {
            exportConfig(ctx, 'queryUserError', user);
        }
        return next;
    } catch (error) {
        exportConfig(ctx, 'queryUserError', {});
        console.log(error);
    }
};


/**
 * 增加管理员
 * @param {*} ctx
 * @param {*} next
 */
exports.addManager = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let userName = body.username;
        let name = body.name;
        let roles = parseInt(body.roles);
        // 先检查是否已经添加
        let checkExist = await userModel.checkUserExist(userName);
        console.log(checkExist);
        if (checkExist.length > 0) {
            exportConfig(ctx, 'managerExist', { code: 1, msg: '管理员已经存在, 无需再添加' });
        } else {
            if (roles && userName) {
                let saveRes = await userModel.addManager(userName, name, roles);
                exportConfig(ctx, 'addManagerSuccess', { code: 0, addNew: saveRes });
            } else {
                exportConfig(ctx, 'addManagerError', { code: 500 });
            }
        }
    } catch (error) {
        exportConfig(ctx, 'addManagerError', { code: 500 });
        console.log(error);
    }
};

/**
 * 删除管理员
 * @param {*} ctx
 * @param {*} next
 */
exports.delManager = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let uid = body.uid;
        let remove = await userModel.delManager(uid);
        console.log(remove);
        let removeRes = {
            ok: 1,
            result: remove,
        }
        exportConfig(ctx, 'delManagerSuccess', removeRes);
        return next;
    } catch (error) {
        exportConfig(ctx, 'delManagerError', { ok: 0 });
        console.log(error);
    }
}

/**
 * 修改管理员密码
 * @param {*} ctx
 * @param {*} next
 */
exports.updateManagerPassword = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let ManagerInfo = {
            uid: body.uid,
            password: body.password,
        };
        let changeManagerRes = await userModel.updateManagerPassword(ManagerInfo);
        if (changeManagerRes.ok === 1) {
            let returnObj = {
                dbResult: changeManagerRes,
                ok: 1,
            };
            exportConfig(ctx, 'success', returnObj);
        } else {
            let returnObj = {
                dbResult: changeManagerRes,
                ok: 0,
            };
            exportConfig(ctx, 'error', returnObj);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
};
/**
 * 查询用户
 * @param {*} ctx
 * @param {*} next
 */
exports.queryAllUsers = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let userInfo = await userModel.queryAllUsers(body);
        let user = {
            docs: userInfo.docs,
            pagination: {
                total: userInfo.total,
                pageSize: userInfo.limit,
                current: userInfo.page,
            },
        };
        if (userInfo.total) {
            exportConfig(ctx, 'success', user);
        } else {
            exportConfig(ctx, 'queryUserError', user);
        }
        return next;
    } catch (error) {
        exportConfig(ctx, 'error', {});
        console.log(error);
    }
};


/**
 * 查询评论
 * @param {*} ctx
 * @param {*} next
 */
exports.queryComments = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let commentsInfo = await userModel.queryComments(body)
        let comments = {
            docs: commentsInfo.docs,
            pagination: {
                total: commentsInfo.total,
                pageSize: commentsInfo.limit,
                current: commentsInfo.page,
            },
        };
        if (commentsInfo.total) {
            exportConfig(ctx, 'success', comments);
        } else {
            exportConfig(ctx, 'error', comments);
        }
        return next;
    } catch (error) {
        exportConfig(ctx, 'error', {});
        console.log(error);
    }
};
/**
 * 添加评论
 * @param {*} ctx
 * @param {*} next
 */
exports.addComments = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let commentsinfo = {
            rate: body.rate,
            content: body.content,
            roomOrder: body.roomOrder,
            name: body.name,
            uid: body.uid,
            email: body.email
        }  
        const addRes = await userModel.addComments(commentsinfo)
        if (addRes) {
            exportConfig(ctx, 'success', addRes);
        } else {
            exportConfig(ctx, 'error', addRes);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
}; 

/**
 * 变更用户类型
 * @param {*} ctx
 * @param {*} next
 */
exports.updateUserType = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let typeInfo = {
            uid: body.uid,
            userType: body.userType
        };
        let changeRes = await userModel.updateUserType(typeInfo);
        if (changeRes.ok === 1) {
            let returnObj = {
                dbResult: changeRes,
                ok: 1,
            };
            exportConfig(ctx, 'success', returnObj);
            if (body.userType == '1') {
                sendEmail(body.email, '退订成功！', '您已退订')
            }
        } else {
            let returnObj = {
                dbResult: changeRes,
                ok: 0,
            };
            exportConfig(ctx, 'error', returnObj);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
};

/**
 * 变更用户信息
 * @param {*} ctx
 * @param {*} next
 */
exports.updateUserInfo = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let userInfo = {
            uid: body.uid,
            name: body.name,
            checkInTime:Date.parse(new Date),
            userType: body.userType,
            age: body.age,
            sex: body.sex,
            roomOrder:body.roomOrder,
            bedId:body.bedId,
            familyName: body.familyName,
            familyAddress: body.familyAddress,
            familyPhone: body.familyPhone,
            idCardNum: body.idCardNum,
        };
        let changeRes = await userModel.updateUserInfo(userInfo);
        if (changeRes.ok === 1) {
            let returnObj = {
                dbResult: changeRes,
                ok: 1,
            };
            exportConfig(ctx, 'success', returnObj);
            // if (body.userType == '1') {
            //     sendEmail(body.email, '退订成功！', '您已退订')
            // }
        } else {
            let returnObj = {
                dbResult: changeRes,
                ok: 0,
            };
            exportConfig(ctx, 'error', returnObj);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
};

/**
 * 新用户注册
 * @param {*} ctx
 * @param {*} next
 */
exports.newUserRegister = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let uidres = await userModel.queryUid();
        let registerCode = phoneCode.getCode(body.phone);
        if (body.phoneVerificationCode == registerCode) {
            let checkUserPhone = await userModel.checkUserPhoneExist(parseInt(body.phone));
            if (checkUserPhone.length != 0 ) {
                let returnObj = {
                    dbResult: '手机号已被注册',
                    ok: 2,
                };
                exportConfig(ctx, 'error', returnObj);
            } else {
                let userInfo = {
                    email: body.email,
                    uid: uidres.uid + 1,
                    password: body.password,
                    phone: body.phone
                };
                let changeRes = await userModel.newUserRegister(userInfo);
                let returnObj = {
                    dbResult: changeRes,
                    ok: 1,
                };
                let Res = await userModel.changeUid(uidres._id);
                exportConfig(ctx, 'success', returnObj);
            }
        } else {
            let returnObj = {
                dbResult: '验证码错误',
                ok: 0,
            };
            exportConfig(ctx, 'error', returnObj);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
};

/**
 * 用户登录
 * @param {*} ctx
 * @param {*} next
 */
exports.usersLogin = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        if(body.loginType == '1') {
            let loginCode = phoneCode.getCode(body.phone);
            if (body.code == loginCode) {
                let userInfo = {
                    phone: body.phone,
                    type:'2'
                };
                let loginRes = await userModel.usersLogin(userInfo)
                if(loginRes) {
                    let returnObj = {
                        dbResult: loginRes,
                        ok: 1,
                    };
                    exportConfig(ctx, 'success', returnObj);
                } else {
                    let returnObj = {
                        dbResult: '登录失败',
                        ok: 0,
                    };
                    exportConfig(ctx, 'error', returnObj);
                }      
            } else {
                let returnObj = {
                    dbResult: '验证码错误',
                    ok: 0,
                };
                exportConfig(ctx, 'error', returnObj);
            }
        } else {
            let userInfo = {
                email: body.email,
                password:body.password,
                type: '1'
            };
            let loginRes = await userModel.usersLogin(userInfo)
            if (loginRes) {
                let returnObj = {
                    dbResult: loginRes,
                    ok: 1,
                };
                exportConfig(ctx, 'success', returnObj);
            } else {
                let returnObj = {
                    dbResult: '登录失败',
                    ok: 0,
                };
                exportConfig(ctx, 'error', returnObj);
            }      
        }  
        return next;
    } catch (error) {
        console.log(error);
    }
};

/**
 * 发送手机验证码
 * @param {*} ctx 
 * @param {*} next 
 */
exports.sendSmsCode = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        // 清空验证码缓存
        phoneCode.deleteCode(body.phone);
        // 设置验证码
        phoneCode.setCode(body.phone);
        // 获取验证码
        let code = phoneCode.getCode(body.phone);
        if (body.type == 'register') {
            sendSMS.sendCode(body.phone, 'SMS_134080256', code)
            exportConfig(ctx, 'success', '发送成功');    
        } else {
            sendSMS.sendCode(body.phone, 'SMS_133035239', code)
            exportConfig(ctx, 'success', '发送成功');    
        } 
        return next;
    } catch (error) {
        console.log(error);
    }
};


/**
 * 查询预约操作日志
 * @param {*} ctx
 * @param {*} next
 */
exports.queryOperateLogs = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let userInfo = await userModel.queryOperateLogs(body)
        let user = {
            docs: userInfo.docs,
            pagination: {
                total: userInfo.total,
                pageSize: userInfo.limit,
                current: userInfo.page,
            },
        };
        if (userInfo.total) {
            exportConfig(ctx, 'success', user);
        } else {
            exportConfig(ctx, 'error', user);
        }
        return next;
    } catch (error) {
        exportConfig(ctx, 'error', {});
        console.log(error);
    }
};


/**
 * 添加操作日志
 * @param {*} ctx
 * @param {*} next
 */
exports.addLogs = async (ctx, next) => {
    try {
        let bodystring = ctx.request.query.body;
        let body = util.parseJson(bodystring);
        let logsinfo = {
            name: body.name,
            uid: body.uid,
            operator:body.operator,
            operatorAvatar:body.operatorAvatar,
            status:body.status
        }
        const addRes = await userModel.addLogs(logsinfo)
        if (addRes) {
            exportConfig(ctx, 'success', addRes);
        } else {
            exportConfig(ctx, 'error', addRes);
        }
        return next;
    } catch (error) {
        console.log(error);
    }
}; 