import {UnknownVersionError} from '../../../../utils'
import {BalancesTransferEvent} from '../../types/events'
import {ChainContext, Event} from '../../types/support'

export const Transfer = {
    decode(ctx: ChainContext, event: Event) {
        let e = new BalancesTransferEvent(ctx, event)
        if (e.isV0) {
            let [from, to, amount] = e.asV0
            return {from, to, amount}
        } else if (e.isV9140) {
            return e.asV9140
        } else {
            throw new UnknownVersionError(e)
        }
    },
}

export default {
    Transfer,
}
